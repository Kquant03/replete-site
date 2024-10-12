import type { TiktokenModel, Tiktoken } from 'tiktoken';
import { tiktokenWasmBase64 } from './tiktokenWasm';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

let tokenizer: Tiktoken;

export async function initializeTokenizer(model: TiktokenModel = 'gpt-3.5-turbo') {
  if (!tokenizer) {
    const tiktoken = await import('tiktoken');
    
    // Decode the Base64 WebAssembly and create a Uint8Array
    const wasmBinary = new Uint8Array(Buffer.from(tiktokenWasmBase64, 'base64'));
    
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