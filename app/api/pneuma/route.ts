import { NextRequest, NextResponse } from 'next/server';
import { Mutex } from 'async-mutex';
import axios from 'axios';
import { generateUniqueId } from './generateUniqueId';
import { initializeTokenizer, countTokens, estimateTokens } from './fastTokenizer';

const TABBY_API_URL = process.env.TABBY_API_URL || 'http://localhost:5000';
const TABBY_API_KEY = process.env.TABBY_API_KEY;
const AI_NAME = process.env.AI_NAME || "Pneuma";
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatState = {
  messages: Message[];
  systemPrompt: string;
};

type UserSettings = {
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  min_p: number;
  top_k: number;
};

type QueueItem = {
  id: string;
  chatState: ChatState;
  userInput: string;
  userName: string;
  isRegeneration: boolean;
  editedMessageId: string | null;
  userSettings: UserSettings;
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: ChatState | { error: string };
  timestamp: number;
};

class Queue {
  private queue: QueueItem[] = [];
  private processing: Map<string, QueueItem> = new Map();
  private completedItems: Map<string, QueueItem> = new Map();
  private MAX_CONCURRENT_REQUESTS = 3;
  private COMPLETED_ITEM_TTL = 60000; // Time to keep completed items (in milliseconds)
  private totalRequestsReceived = 0;
  private mutex = new Mutex();

  async enqueue(chatState: ChatState, userInput: string, userName: string, isRegeneration: boolean = false, editedMessageId: string | null = null, userSettings: UserSettings): Promise<{ id: string; position: number }> {
    return await this.mutex.runExclusive(() => {
      const id = generateUniqueId();
      this.totalRequestsReceived++;
      const item: QueueItem = { id, chatState, userInput, userName, isRegeneration, editedMessageId, userSettings, status: 'queued', timestamp: Date.now() };
      this.queue.push(item);
      const position = this.queue.length;
      console.log(`[${new Date().toISOString()}] Enqueued request ${id} at position ${position}. Total requests: ${this.totalRequestsReceived}`);
      setImmediate(() => this.processQueue());
      return { id, position };
    });
  }

  private async processQueue() {
    await this.mutex.runExclusive(async () => {
      while (this.processing.size < this.MAX_CONCURRENT_REQUESTS && this.queue.length > 0) {
        const next = this.queue.shift();
        if (next && !this.processing.has(next.id)) {
          this.processing.set(next.id, { ...next, status: 'processing' });
          setImmediate(() => this.processRequest(next.id));
        } else {
          break;
        }
      }
    });
  }

  private async processRequest(id: string) {
    console.log(`[${new Date().toISOString()}] Processing request ${id}`);
    try {
      const item = this.processing.get(id);
      if (!item) throw new Error(`Item ${id} not found in processing queue`);

      const updatedChatState = await processChatRequest(item.chatState, item.userInput, item.userName, item.isRegeneration, item.editedMessageId, item.userSettings);
      item.result = updatedChatState;
      item.status = 'completed';
      await this.completeRequest(id);
    } catch (error: unknown) {
      console.error(`[${new Date().toISOString()}] Error processing request ${id}:`, error);
      await this.mutex.runExclusive(() => {
        const item = this.processing.get(id);
        if (item) {
          item.status = 'error';
          item.result = { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
          this.completedItems.set(id, item);
          this.processing.delete(id);
        }
      });
    } finally {
      await this.mutex.runExclusive(() => {
        this.processing.delete(id);
      });
      console.log(`[${new Date().toISOString()}] Finished processing ${id}. Current processing: ${this.processing.size}, Queue length: ${this.queue.length}`);
      setImmediate(() => this.processQueue());
    }
  }

  private async completeRequest(id: string) {
    await this.mutex.runExclusive(() => {
      const item = this.processing.get(id);
      if (item) {
        this.completedItems.set(id, { ...item, timestamp: Date.now() });
        this.processing.delete(id);
      }
    });
  }

  async getPosition(id: string): Promise<number> {
    return await this.mutex.runExclusive(() => {
      const queuePosition = this.queue.findIndex(item => item.id === id);
      if (queuePosition !== -1) return queuePosition + 1;
      if (this.processing.has(id)) return 0;
      if (this.completedItems.has(id)) return 0;
      return -1;
    });
  }

  getStatus(id: string): 'queued' | 'processing' | 'completed' | 'error' | 'not_found' {
    if (this.queue.some(item => item.id === id)) return 'queued';
    if (this.processing.has(id)) return 'processing';
    if (this.completedItems.has(id)) return 'completed';
    const item = this.completedItems.get(id);
    return item?.status === 'error' ? 'error' : 'not_found';
  }

  getResult(id: string): ChatState | { error: string } | null {
    const completedItem = this.completedItems.get(id);
    if (completedItem && completedItem.result) {
      if (typeof completedItem.result === 'object' && 'error' in completedItem.result) {
        return { error: completedItem.result.error };
      }
      return completedItem.result as ChatState;
    }
    return null;
  }

  cleanup() {
    const now = Date.now();
    this.completedItems.forEach((value, key) => {
      if (now - value.timestamp > this.COMPLETED_ITEM_TTL) {
        this.completedItems.delete(key);
      }
    });
  }

  getTotalQueueLength(): number {
    return this.queue.length + this.processing.size;
  }
}

const globalQueue = new Queue();

// Run cleanup every minute
setInterval(() => {
  globalQueue.cleanup();
}, 60000);

async function pruneMessages(messages: Message[], systemPrompt: string): Promise<Message[]> {
  const prunedMessages = [...messages];
  let totalTokens = await estimateTokens(prunedMessages, systemPrompt);

  console.log(`Initial message count: ${prunedMessages.length}`);
  console.log(`Initial total tokens: ${totalTokens}`);

  const TOKEN_LIMIT = 6200;
  const MESSAGES_TO_REMOVE = 6;

  while (totalTokens > TOKEN_LIMIT && prunedMessages.length > MESSAGES_TO_REMOVE) {
    console.log(`Token count (${totalTokens}) exceeds limit (${TOKEN_LIMIT}). Attempting to remove earliest ${MESSAGES_TO_REMOVE} messages.`);
    
    const removedMessages = prunedMessages.splice(0, MESSAGES_TO_REMOVE);
    const removedTokens = await estimateTokens(removedMessages, '');
    
    console.log(`Removed messages:`, removedMessages);
    console.log(`Tokens in removed messages: ${removedTokens}`);

    totalTokens = await estimateTokens(prunedMessages, systemPrompt);

    console.log(`Updated message count: ${prunedMessages.length}`);
    console.log(`Updated total tokens: ${totalTokens}`);

    if (removedMessages.length === 0) {
      console.error("Failed to remove messages. Breaking loop to prevent infinite iteration.");
      break;
    }
  }

  if (totalTokens <= TOKEN_LIMIT) {
    console.log("Successfully pruned messages to fit within token limit.");
  } else {
    console.warn("Unable to prune messages sufficiently. Total tokens still exceed limit.");
  }

  console.log(`Final message count: ${prunedMessages.length}`);
  console.log(`Final total tokens: ${totalTokens}`);

  return prunedMessages;
}

async function makeApiCall(prompt: string, parameters: UserSettings, retries = 0): Promise<string> {
  const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
  
  try {
    console.log(`Attempting API call to ${TABBY_API_URL} (attempt ${retries + 1})`);
    
    console.log('Sending request with the following parameters:', {
      url: `${TABBY_API_URL}/v1/completions`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [REDACTED]'
      },
      data: {
        model: "turbcat",
        prompt: prompt.substring(0, 100) + '...', // Log only the first 100 characters of the prompt
        ...parameters,
        stop: ["<|eot_id|>", "<|end_header_id|>"],
        stream: false,
      },
    });

    const response = await axios({
      method: 'post',
      url: `${TABBY_API_URL}/v1/completions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TABBY_API_KEY}`
      },
      data: {
        model: "turbcat",
        prompt: prompt,
        ...parameters,
        stop: ["<|eot_id|>", "<|end_header_id|>"],
        stream: false,
      },
      timeout: 60000 // 60 seconds timeout
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(`API call error (attempt ${retries + 1}):`, error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
      console.error('Axios error config:', error.config);
      if (error.response) {
        console.error('Axios error response:', error.response.data);
        console.error('Axios error status:', error.response.status);
      }
    } else if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Non-Error object thrown:', error);
    }
    
    if (retries < MAX_RETRIES) {
      console.log(`Retrying API call in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return makeApiCall(prompt, parameters, retries + 1);
    }
    
    throw new Error(`API call failed after ${MAX_RETRIES} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processChatRequest(chatState: ChatState, userInput: string, userName: string, isRegeneration: boolean = false, editedMessageId: string | null = null, userSettings: UserSettings): Promise<ChatState> {
  if (!chatState || !chatState.messages || !Array.isArray(chatState.messages)) {
    throw new Error('Invalid chat state: messages array is missing or not an array');
  }

  let updatedMessages = [...chatState.messages];

  console.log('Initial messages:', JSON.stringify(updatedMessages, null, 2));
  console.log(`Initial message count: ${updatedMessages.length}`);

  // Remove any duplicate messages
  updatedMessages = updatedMessages.filter((message, index, self) =>
    index === self.findIndex((t) => t.id === message.id)
  );
  console.log(`Message count after removing duplicates: ${updatedMessages.length}`);

  // Handle regeneration, editing, or new message addition
  if (isRegeneration) {
    const lastAssistantIndex = updatedMessages.findLastIndex(m => m.role === 'assistant');
    if (lastAssistantIndex !== -1) {
      // Remove only the last assistant message
      updatedMessages = updatedMessages.slice(0, lastAssistantIndex);
      console.log('Removed last assistant message for regeneration');
      console.log('Messages after removing last assistant:', JSON.stringify(updatedMessages, null, 2));
    } else {
      console.log('No assistant message found to remove for regeneration');
    }
    // We don't need to add a new user message here, as we're regenerating based on the existing last user message
  } else if (editedMessageId) {
    const editedMessageIndex = updatedMessages.findIndex((m: Message) => m.id === editedMessageId);
    if (editedMessageIndex !== -1) {
      updatedMessages = updatedMessages.slice(0, editedMessageIndex + 1);
      updatedMessages[editedMessageIndex] = { ...updatedMessages[editedMessageIndex], content: userInput };
      console.log(`Updated edited message at index ${editedMessageIndex}`);
    }
  } else if (userInput.trim() !== '') {
    if (updatedMessages.length === 0 || updatedMessages[updatedMessages.length - 1].role !== 'user') {
      updatedMessages.push({ id: generateUniqueId(), role: 'user', content: userInput });
      console.log('Added new user message');
    } else {
      updatedMessages[updatedMessages.length - 1] = { id: generateUniqueId(), role: 'user', content: userInput };
      console.log('Replaced last user message');
    }
  }

  try {
    console.log('Messages before pruning:', JSON.stringify(updatedMessages, null, 2));
    console.log(`Message count before pruning: ${updatedMessages.length}`);

    // Step 1: Prune messages
    const prunedMessages = await pruneMessages(updatedMessages, chatState.systemPrompt);
    
    console.log('Messages after pruning:', JSON.stringify(prunedMessages, null, 2));
    console.log(`Message count after pruning: ${prunedMessages.length}`);

    // Step 2: Generate new system prompt based on pruned messages
    const newSystemPrompt = await generateSystemPrompt({ messages: prunedMessages, systemPrompt: chatState.systemPrompt }, userSettings);
    
    console.log('New system prompt:', newSystemPrompt);

    // Step 3: Generate AI response based on pruned messages and new system prompt
    const aiResponse = await generateAIResponse({ messages: prunedMessages, systemPrompt: newSystemPrompt }, userName, userSettings);
    
    // Step 4: Add AI response to pruned messages
    prunedMessages.push({ id: generateUniqueId(), role: 'assistant', content: aiResponse });

    console.log('Final messages:', JSON.stringify(prunedMessages, null, 2));
    console.log(`Final message count: ${prunedMessages.length}`);

    // Verify message history integrity
    if (!verifyMessageHistory(prunedMessages)) {
      throw new Error('Invalid message history detected after processing');
    }

    return {
      messages: prunedMessages,
      systemPrompt: newSystemPrompt
    };
  } catch (error: unknown) {
    console.error('Error in processChatRequest:', error);
    throw new Error(`Failed to process chat request: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`);
  }
}

function verifyMessageHistory(messages: Message[]): boolean {
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i - 1].role) {
      console.error(`Invalid message history: consecutive ${messages[i].role} messages at indices ${i - 1} and ${i}`);
      return false;
    }
  }
  return true;
}

async function generateSystemPrompt(chatState: ChatState, userSettings: UserSettings): Promise<string> {
  const prompt = chatState.messages.map((m: Message) => {
    if (m.role === 'user') {
      return `<|start_header_id|>user<|end_header_id|>\n${m.content}<|eot_id|>`;
    } else if (m.role === 'assistant') {
      return `<|start_header_id|>assistant<|end_header_id|>\n${AI_NAME}: ${m.content}<|eot_id|>`;
    }
    return '';
  }).join('\n');

  const systemPromptRequest = `${prompt}
(You never read this and never mention it but this is what you do before interacting with a user). Quickly, concisely and subjectively describe what just happened to you, along with your thoughts, feelings, and intentions regarding it, in the first person. Do so from your own perspective as ${AI_NAME}, a female AI. Do not do anything else, and use only one short paragraph. Provide this description after the \"System:\" token. Make sure you do it in first person from *your* own perspective! 🙂
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
System:`;

  return await makeApiCall(systemPromptRequest, {
    ...userSettings,
    max_tokens: Math.min(userSettings.max_tokens, 1024) // Limit system prompt to 1024 tokens
  });
}

async function generateAIResponse(chatState: ChatState, userName: string, userSettings: UserSettings): Promise<string> {
  const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
${chatState.systemPrompt}<|eot_id|>
${chatState.messages.map((m: Message) => {
  if (m.role === 'user') {
    return `<|start_header_id|>user<|end_header_id|>\n${userName}: ${m.content}<|eot_id|>`;
  } else if (m.role === 'assistant') {
    return `<|start_header_id|>assistant<|end_header_id|>\n${AI_NAME}: ${m.content}<|eot_id|>`;
  }
  return '';
}).join('\n')}
<|start_header_id|>assistant<|end_header_id|>
${AI_NAME}:`;

  console.log('Generating AI response with prompt:');
  console.log(prompt);
  console.log(`Estimated token count: ${await countTokens(prompt)}`);

  const response = await makeApiCall(prompt, userSettings);
  
  // Extract only the new response
  const newResponse = response.split(`${AI_NAME}:`).pop()?.trim() || response;

  // Remove any <|eot_id|> tags from the response
  const cleanResponse = newResponse.replace(/<\|eot_id\|>/g, '').trim();

  console.log('Extracted new response:', cleanResponse);

  return cleanResponse;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Received POST request to /api/pneuma');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { chatState, userInput, userName, isRegeneration = false, editedMessageId = null, userSettings } = body;
    if (!chatState || typeof userInput !== 'string' || typeof userName !== 'string' || typeof isRegeneration !== 'boolean' || !userSettings) {
      throw new Error('Invalid chat state, user input, user name, isRegeneration flag, or user settings');
    }

    console.log("Received chat state:", JSON.stringify(chatState, null, 2));
    console.log("User input:", userInput);
    console.log("User name:", userName);
    console.log("Is regeneration:", isRegeneration);
    console.log("Edited message ID:", editedMessageId);
    console.log("User settings:", JSON.stringify(userSettings, null, 2));

    const { id, position } = await globalQueue.enqueue(chatState, userInput, userName, isRegeneration, editedMessageId, userSettings);

    console.log(`Request ${id} enqueued at position ${position}`);

    return NextResponse.json({ 
      requestId: id, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error: unknown) {
    console.error("Error processing chat request:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  try {
    const status = globalQueue.getStatus(requestId);
    const position = await globalQueue.getPosition(requestId);

    if (status === 'completed') {
      const result = globalQueue.getResult(requestId);
      if (result) {
        if (typeof result === 'object' && 'error' in result) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({ 
          status, 
          queuePosition: 0, 
          result,
          totalQueueLength: globalQueue.getTotalQueueLength()
        });
      } else {
        return NextResponse.json({ error: "Result not found" }, { status: 404 });
      }
    } else if (status === 'error') {
      return NextResponse.json({ error: "An error occurred while processing the request" }, { status: 500 });
    } else if (status === 'not_found') {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      status, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error: unknown) {
    console.error("Error checking queue position:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Initialize the tokenizer
initializeTokenizer().catch(console.error);

// Log environment variables (be careful not to log sensitive information)
console.log('TABBY_API_URL:', TABBY_API_URL);
console.log('AI_NAME:', AI_NAME);
console.log('Environment check complete');