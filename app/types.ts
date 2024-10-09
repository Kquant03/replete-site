// Message type with required id field
export type Message = {
  id: string;  // Changed from optional to required
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  messages: Message[];
}

export interface UserSettings {
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  min_p: number;
  top_k: number;
}

export interface ApiRequest {
  chat: Chat;
  userSettings: UserSettings;
  user_name: string;
}

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