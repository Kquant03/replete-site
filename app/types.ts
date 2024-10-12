// Message type with required id field
export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatState = {
  messages: Message[];
  systemPrompt: string;
};

export type UserSettings = {
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  min_p: number;
  top_k: number;
};

// Type for server action results
export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>

export interface Session {
  user: {
    id: string;
    email: string;
  }
}