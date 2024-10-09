// Define the Message type
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Simple tokenizer function
function simpleTokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+|[.,!?;()"'-]/g).filter(Boolean);
}

export async function initializeTokenizer(): Promise<void> {
  // No initialization needed for the simple tokenizer
}

export async function countTokens(text: string): Promise<number> {
  return simpleTokenize(text).length;
}

export async function estimateTokens(messages: Message[], systemPrompt: string): Promise<number> {
  let tokenCount = simpleTokenize(systemPrompt).length;

  for (const message of messages) {
    // Estimate tokens for role and content
    tokenCount += simpleTokenize(message.role).length;
    tokenCount += simpleTokenize(message.content).length;
    tokenCount += 4; // Add some padding for special tokens
  }

  return tokenCount;
}