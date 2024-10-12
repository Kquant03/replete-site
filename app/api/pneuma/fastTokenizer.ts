import type { TiktokenModel, Tiktoken } from 'tiktoken';
import path from 'path';
import { promises as fs } from 'fs';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

let tokenizer: Tiktoken;

export async function initializeTokenizer(model: TiktokenModel = 'gpt-3.5-turbo') {
  if (!tokenizer) {
    const tiktoken = await import('tiktoken');
    
    // Dynamically load the WebAssembly file
    const wasmPath = path.join(process.cwd(), 'public', 'tiktoken_bg.wasm');
    const wasmBinary = await fs.readFile(wasmPath);
    
    // @ts-expect-error: __wasm property is not in the type definitions
    tiktoken.__wasm = wasmBinary;
    
    tokenizer = await tiktoken.encoding_for_model(model);
  }
}

export async function countTokens(text: string): Promise<number> {
  if (!tokenizer) {
    await initializeTokenizer();
  }
  return tokenizer.encode(text).length;
}

export async function estimateTokens(messages: Message[], systemPrompt: string): Promise<number> {
  if (!tokenizer) {
    await initializeTokenizer();
  }

  let tokenCount = 0;

  tokenCount += tokenizer.encode(systemPrompt).length;

  for (const message of messages) {
    tokenCount += 4; // For the special tokens
    tokenCount += tokenizer.encode(message.role).length;
    tokenCount += tokenizer.encode(message.content).length;
  }

  return tokenCount;
}