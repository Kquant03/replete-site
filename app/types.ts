export type MessageStatus = 'entering' | 'active' | 'exiting' | 'sliding';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: MessageStatus;
}

export interface ChatState {
  messages: Message[];
  systemPrompt: string;
  title?: string;  // Add this line
}

export interface Chat extends ChatState {
  _id?: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface UserSettings {
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  min_p: number;
  top_k: number;
}

export interface ProcessedChatResult {
  messages: Message[];
  systemPrompt: string;
  title?: string;
}

export interface ErrorResult {
  error: string;
}

export type QueueResult = ProcessedChatResult | ErrorResult;

export type QueueItemType = 'chat' | 'title';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  chatState: ChatState;
  userInput: string;
  userName: string;
  isRegeneration: boolean;
  editedMessageId: string | null;
  userSettings: UserSettings;
  usePreDefinedPrompt: boolean;
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: QueueResult;
  timestamp: number;
}

export interface ApiRequest {
  chatId: string;
  chatState: ChatState;
  userInput: string;
  userName: string;
  isRegeneration: boolean;
  editedMessageId: string | null;
  userSettings: UserSettings;
  usePreDefinedPrompt: boolean;
  generateTitle: boolean;
  type: 'chat' | 'title';
}