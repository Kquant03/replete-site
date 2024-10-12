import { generateUniqueId } from './generateUniqueId';
import { initializeTokenizer as initTokenizer, countTokens, estimateTokens } from './fastTokenizer';
import { ChatState, Message, UserSettings } from './queue';

const TABBY_API_URL = process.env.TABBY_API_URL || 'http://localhost:5000';
const TABBY_API_KEY = process.env.TABBY_API_KEY;
const AI_NAME = process.env.AI_NAME || "Pneuma";
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
export const TOKEN_LIMIT = 6200;

export async function initializeTokenizer(): Promise<void> {
  await initTokenizer('gpt-3.5-turbo');
}

export async function pruneMessages(messages: Message[], systemPrompt: string): Promise<Message[]> {
  const prunedMessages = [...messages];
  let totalTokens = await estimateTokens(prunedMessages, systemPrompt);

  console.log(`Initial message count: ${prunedMessages.length}`);
  console.log(`Initial total tokens: ${totalTokens}`);

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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    const response = await fetch(`${TABBY_API_URL}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TABBY_API_KEY}`
      },
      body: JSON.stringify({
        model: "turbcat",
        prompt: prompt,
        ...parameters,
        stop: ["<|eot_id|>", "<|end_header_id|>"],
        stream: false,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].text.trim();
  } catch (error: unknown) {
    console.error(`API call error (attempt ${retries + 1}):`, error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if ('cause' in error && error.cause !== undefined) {
        console.error('Error cause:', error.cause);
      }
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

export async function generateSystemPrompt(chatState: ChatState, userSettings: UserSettings): Promise<string> {
  const prompt = chatState.messages.map((m: Message) => {
    if (m.role === 'user') {
      return `<|start_header_id|>user<|end_header_id|>\n${m.content}<|eot_id|>`;
    } else if (m.role === 'assistant') {
      return `<|start_header_id|>assistant<|end_header_id|>\n${AI_NAME}: ${m.content}<|eot_id|>`;
    }
    return '';
  }).join('\n');

  const systemPromptRequest = `${prompt}
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Analyze the conversation above and generate a concise system prompt for ${AI_NAME}, an AI assistant. The prompt should:
1. Summarize the current context and topics of discussion
2. Reflect ${AI_NAME}'s personality and role in the conversation
3. Anticipate potential next steps or questions
4. Be written in first-person from ${AI_NAME}'s perspective
5. Not exceed 100 words

Begin the prompt with "As ${AI_NAME}, I am" and focus on the most relevant aspects of the conversation.

System prompt:`;

  return await makeApiCall(systemPromptRequest, {
    ...userSettings,
    max_tokens: Math.min(userSettings.max_tokens, 1024) // Limit system prompt to 1024 tokens
  });
}

export async function generateAIResponse(chatState: ChatState, userName: string, userSettings: UserSettings): Promise<string> {
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

export async function processChatRequest(chatState: ChatState, userInput: string, userName: string, isRegeneration: boolean = false, editedMessageId: string | null = null, userSettings: UserSettings): Promise<ChatState> {
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
      updatedMessages = updatedMessages.slice(0, lastAssistantIndex);
      console.log('Removed last assistant message for regeneration');
      console.log('Messages after removing last assistant:', JSON.stringify(updatedMessages, null, 2));
    } else {
      console.log('No assistant message found to remove for regeneration');
    }
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

export { AI_NAME };