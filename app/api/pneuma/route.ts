import { NextRequest, NextResponse } from 'next/server';
import { Mutex } from 'async-mutex';
import axios from 'axios';
import https from 'https';
import { generateUniqueId } from './generateUniqueId';
import { initializeTokenizer, countTokens, estimateTokens } from './fastTokenizer';
import { createLogger, format, transports } from 'winston';

const TABBY_API_URL = process.env.TABBY_API_URL || 'http://localhost:5000';
const TABBY_API_KEY = process.env.TABBY_API_KEY;
const AI_NAME = process.env.AI_NAME || "Pneuma";
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const api = axios.create({
  timeout: 120000, // 2 minutes
  httpsAgent: new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000, // 30 seconds
  }),
});

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
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
  messages: Message[];
  userInput: string;
  userName: string;
  userSettings: UserSettings;
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: string;
  timestamp: number;
};

class Queue {
  private queue: QueueItem[] = [];
  private processing: Map<string, QueueItem> = new Map();
  private completedItems: Map<string, QueueItem> = new Map();
  private MAX_CONCURRENT_REQUESTS = 3;
  private COMPLETED_ITEM_TTL = 300000; // 5 minutes
  private totalRequestsReceived = 0;
  private mutex = new Mutex();

  async enqueue(messages: Message[], userInput: string, userName: string, userSettings: UserSettings): Promise<{ id: string; position: number }> {
    return await this.mutex.runExclusive(() => {
      const id = generateUniqueId();
      this.totalRequestsReceived++;
      const item: QueueItem = { id, messages, userInput, userName, userSettings, status: 'queued', timestamp: Date.now() };
      this.queue.push(item);
      const position = this.queue.length;
      logger.info(`Enqueued request ${id} at position ${position}. Total requests: ${this.totalRequestsReceived}`);
      setImmediate(() => this.processQueue());
      return { id, position };
    });
  }

  private async processQueue() {
    await this.mutex.runExclusive(async () => {
      const availableSlots = this.MAX_CONCURRENT_REQUESTS - this.processing.size;
      const itemsToProcess = this.queue.slice(0, availableSlots);
      
      for (const item of itemsToProcess) {
        this.queue = this.queue.filter(queueItem => queueItem.id !== item.id);
        this.processing.set(item.id, { ...item, status: 'processing' });
        this.processRequest(item.id).catch(error => logger.error('Error processing request', { error, requestId: item.id }));
      }
    });
  }

  private async processRequest(id: string) {
    logger.info(`Processing request ${id}`);
    try {
      const item = this.processing.get(id);
      if (!item) throw new Error(`Item ${id} not found in processing queue`);

      const response = await generateAIResponse(item.messages, item.userInput, item.userName, item.userSettings);
      item.result = response;
      item.status = 'completed';
      await this.completeRequest(id);
    } catch (error: unknown) {
      logger.error(`Error processing request ${id}:`, error);
      await this.mutex.runExclusive(() => {
        const item = this.processing.get(id);
        if (item) {
          item.status = 'error';
          item.result = error instanceof Error ? error.message : 'An unexpected error occurred';
          this.completedItems.set(id, item);
          this.processing.delete(id);
        }
      });
    } finally {
      await this.mutex.runExclusive(() => {
        this.processing.delete(id);
      });
      logger.info(`Finished processing ${id}. Current processing: ${this.processing.size}, Queue length: ${this.queue.length}`);
      this.processQueue().catch(error => logger.error('Error processing queue', { error }));
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
    if (this.completedItems.has(id)) {
      const item = this.completedItems.get(id);
      return item?.status === 'error' ? 'error' : 'completed';
    }
    return 'not_found';
  }

  getResult(id: string): string | null {
    const completedItem = this.completedItems.get(id);
    return completedItem?.result || null;
  }

  cleanup() {
    const now = Date.now();
    let removedCount = 0;
    this.completedItems.forEach((value, key) => {
      if (now - value.timestamp > this.COMPLETED_ITEM_TTL) {
        this.completedItems.delete(key);
        removedCount++;
      }
    });
    logger.info(`Cleaned up ${removedCount} completed items from the queue`);
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

async function pruneMessages(messages: Message[]): Promise<Message[]> {
  const prunedMessages = [...messages];
  let totalTokens = await estimateTokens(prunedMessages, '');

  logger.info(`Initial message count: ${prunedMessages.length}, Initial total tokens: ${totalTokens}`);

  const TOKEN_LIMIT = 6200;
  const MESSAGES_TO_REMOVE = 2;

  while (totalTokens > TOKEN_LIMIT && prunedMessages.length > MESSAGES_TO_REMOVE) {
    logger.info(`Token count (${totalTokens}) exceeds limit (${TOKEN_LIMIT}). Attempting to remove earliest ${MESSAGES_TO_REMOVE} messages.`);
    
    const removedMessages = prunedMessages.splice(0, MESSAGES_TO_REMOVE);
    const removedTokens = await estimateTokens(removedMessages, '');
    
    logger.info(`Removed messages: ${JSON.stringify(removedMessages)}, Tokens in removed messages: ${removedTokens}`);

    totalTokens = await estimateTokens(prunedMessages, '');

    logger.info(`Updated message count: ${prunedMessages.length}, Updated total tokens: ${totalTokens}`);

    if (removedMessages.length === 0) {
      logger.error("Failed to remove messages. Breaking loop to prevent infinite iteration.");
      break;
    }
  }

  if (totalTokens <= TOKEN_LIMIT) {
    logger.info("Successfully pruned messages to fit within token limit.");
  } else {
    logger.warn("Unable to prune messages sufficiently. Total tokens still exceed limit.");
  }

  logger.info(`Final message count: ${prunedMessages.length}, Final total tokens: ${totalTokens}`);

  return prunedMessages;
}

async function makeApiCall(prompt: string, parameters: UserSettings, retries = 0): Promise<string> {
  const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
  
  try {
    logger.info(`Attempting API call to ${TABBY_API_URL} (attempt ${retries + 1})`);

    const response = await api.post(`${TABBY_API_URL}/v1/completions`, {
      model: "turbcat",
      prompt: prompt,
      ...parameters,
      stop: ["<|eot_id|>", "<|end_header_id|>"],
      stream: false,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TABBY_API_KEY}`
      },
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    logger.error(`API call error (attempt ${retries + 1}):`, error);
    
    if (axios.isAxiosError(error)) {
      logger.error('Axios error:', error.message);
      logger.error('Axios error config:', error.config);
      if (error.response) {
        logger.error('Axios error response:', error.response.data);
        logger.error('Axios error status:', error.response.status);
      }
    }
    
    if (retries < MAX_RETRIES) {
      logger.info(`Retrying API call in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return makeApiCall(prompt, parameters, retries + 1);
    }
    
    throw new Error(`API call failed after ${MAX_RETRIES} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateSystemPrompt(messages: Message[], userSettings: UserSettings): Promise<string> {
  const prompt = messages.map((m: Message) => {
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

async function generateAIResponse(messages: Message[], userInput: string, userName: string, userSettings: UserSettings): Promise<string> {
  const prunedMessages = await pruneMessages(messages);
  
  // Generate system prompt
  const systemPrompt = await generateSystemPrompt(prunedMessages, userSettings);
  
  const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
${systemPrompt}<|eot_id|>
${prunedMessages.map((m: Message) => {
  if (m.role === 'user') {
    return `<|start_header_id|>user<|end_header_id|>\n${userName}: ${m.content}<|eot_id|>`;
  } else if (m.role === 'assistant') {
    return `<|start_header_id|>assistant<|end_header_id|>\n${AI_NAME}: ${m.content}<|eot_id|>`;
  }
  return '';
}).join('\n')}
<|start_header_id|>user<|end_header_id|>
${userName}: ${userInput}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
${AI_NAME}:`;

  logger.info('Generating AI response with prompt:');
  logger.info(prompt);
  logger.info(`Estimated token count: ${await countTokens(prompt)}`);

  const response = await makeApiCall(prompt, userSettings);
  
  // Extract only the new response
  const newResponse = response.split(`${AI_NAME}:`).pop()?.trim() || response;

  // Remove any <|eot_id|> tags from the response
  const cleanResponse = newResponse.replace(/<\|eot_id\|>/g, '').trim();

  logger.info('Extracted new response:', cleanResponse);

  return cleanResponse;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Received POST request to /api/pneuma');
    const body = await request.json();
    logger.info('Request body:', JSON.stringify(body, null, 2));

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { messages, userInput, userName, userSettings } = body;
    if (!Array.isArray(messages) || typeof userInput !== 'string' || typeof userName !== 'string' || !userSettings) {
      throw new Error('Invalid messages, user input, user name, or user settings');
    }

    logger.info("Received messages:", JSON.stringify(messages, null, 2));
    logger.info("User input:", userInput);
    logger.info("User name:", userName);
    logger.info("User settings:", JSON.stringify(userSettings, null, 2));

    const { id, position } = await globalQueue.enqueue(messages, userInput, userName, userSettings);

    logger.info(`Request ${id} enqueued at position ${position}`);

    return NextResponse.json({ 
      requestId: id, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error: unknown) {
    logger.error("Error processing chat request:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    logger.warn("GET request received without requestId");
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  try {
    const status = globalQueue.getStatus(requestId);
    const position = await globalQueue.getPosition(requestId);

    logger.info(`GET request for ${requestId}: Status: ${status}, Position: ${position}`);

    if (status === 'completed' || status === 'error') {
      const result = globalQueue.getResult(requestId);
      if (result) {
        logger.info(`Returning completed result for request ${requestId}`);
        return NextResponse.json({ 
          status, 
          queuePosition: 0, 
          result,
          totalQueueLength: globalQueue.getTotalQueueLength()
        });
      } else {
        logger.warn(`Result not found for completed request ${requestId}`);
        return NextResponse.json({ error: "Result not found" }, { status: 404 });
      }
    } else if (status === 'not_found') {
      logger.warn(`Request ${requestId} not found in queue`);
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    logger.info(`Returning status for request ${requestId}: ${status}, position: ${position}`);
    return NextResponse.json({ 
      status, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error: unknown) {
    logger.error(`Error checking queue position for ${requestId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Initialize the tokenizer
initializeTokenizer().catch(error => logger.error("Error initializing tokenizer:", error));

// Log environment variables (be careful not to log sensitive information)
logger.info('TABBY_API_URL:', TABBY_API_URL);
logger.info('AI_NAME:', AI_NAME);
logger.info('Environment check complete');