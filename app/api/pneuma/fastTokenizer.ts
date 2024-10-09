import type { TiktokenModel, Tiktoken } from 'tiktoken';

// Define the Message type
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

let tokenizer: Tiktoken | null = null;

export async function initializeTokenizer(model: TiktokenModel = 'gpt-3.5-turbo'): Promise<void> {
  if (!tokenizer) {
    const tiktoken = await import('tiktoken');
    tokenizer = await tiktoken.encoding_for_model(model);
  }
}

export async function countTokens(text: string): Promise<number> {
  if (!tokenizer) {
    await initializeTokenizer();
  }
  return tokenizer!.encode(text).length;
}

export async function estimateTokens(messages: Message[], systemPrompt: string): Promise<number> {
  if (!tokenizer) {
    await initializeTokenizer();
  }

  let tokenCount = 0;

  // Count tokens in the system prompt
  tokenCount += tokenizer!.encode(systemPrompt).length;

  // Count tokens in each message
  for (const message of messages) {
    // Every message follows <|start_header_id|>{role}<|end_header_id|>\n{content}<|eot_id|>
    tokenCount += 4; // For the special tokens
    tokenCount += tokenizer!.encode(message.role).length;
    tokenCount += tokenizer!.encode(message.content).length;
  }

  return tokenCount;
}