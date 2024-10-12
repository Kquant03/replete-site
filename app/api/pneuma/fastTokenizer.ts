type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// A simple tokenization function
function simpleTokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[\w']+\b/g) || [];
}

export function estimateTokens(messages: Message[], systemPrompt: string): number {
  let tokenCount = simpleTokenize(systemPrompt).length;

  for (const message of messages) {
    // Estimate 4 tokens for role and message structure
    tokenCount += 4;
    tokenCount += simpleTokenize(message.role).length;
    tokenCount += simpleTokenize(message.content).length;
  }

  // Add a 10% buffer to account for potential underestimation
  return Math.ceil(tokenCount * 1.1);
}

export function countTokens(text: string): number {
  return simpleTokenize(text).length;
}