import { Mutex } from 'async-mutex';
import { generateUniqueId } from './generateUniqueId';
import { processChatRequest } from './aiProcessing';

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

type QueueItem = {
  id: string;
  chatState: ChatState;
  userInput: string;
  userName: string;
  isRegeneration: boolean;
  editedMessageId: string | null;
  userSettings: UserSettings;
  usePreDefinedPrompt: boolean;
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: ChatState | { error: string };
  timestamp: number;
};

export class Queue {
  private queue: QueueItem[] = [];
  private processing: Map<string, QueueItem> = new Map();
  private completedItems: Map<string, QueueItem> = new Map();
  private COMPLETED_ITEM_TTL = 60000; // Time to keep completed items (in milliseconds)
  private totalRequestsReceived = 0;
  private mutex = new Mutex();

  constructor(private MAX_CONCURRENT_REQUESTS: number) {}

  async enqueue(
    chatState: ChatState, 
    userInput: string, 
    userName: string, 
    isRegeneration: boolean = false, 
    editedMessageId: string | null = null, 
    userSettings: UserSettings,
    usePreDefinedPrompt: boolean
  ): Promise<{ id: string; position: number }> {
    return await this.mutex.runExclusive(() => {
      const id = generateUniqueId();
      this.totalRequestsReceived++;
      const item: QueueItem = { 
        id, 
        chatState, 
        userInput, 
        userName, 
        isRegeneration, 
        editedMessageId, 
        userSettings, 
        usePreDefinedPrompt,
        status: 'queued', 
        timestamp: Date.now() 
      };
      this.queue.push(item);
      const position = this.queue.length;
      console.log(`[${new Date().toISOString()}] Enqueued request ${id} at position ${position}. Total requests: ${this.totalRequestsReceived}`);
      setImmediate(() => this.processQueue());
      return { id, position };
    });
  }

  private async processQueue() {
    await this.mutex.runExclusive(async () => {
      while (this.processing.size < this.MAX_CONCURRENT_REQUESTS && this.queue.length > 0) {
        const next = this.queue.shift();
        if (next && !this.processing.has(next.id)) {
          this.processing.set(next.id, { ...next, status: 'processing' });
          setImmediate(() => this.processRequest(next.id));
        } else {
          break;
        }
      }
    });
  }

  private async processRequest(id: string) {
    console.log(`[${new Date().toISOString()}] Processing request ${id}`);
    try {
      const item = this.processing.get(id);
      if (!item) throw new Error(`Item ${id} not found in processing queue`);

      const updatedChatState = await processChatRequest(
        item.chatState, 
        item.userInput, 
        item.userName, 
        item.isRegeneration, 
        item.editedMessageId, 
        item.userSettings,
        item.usePreDefinedPrompt
      );
      item.result = updatedChatState;
      item.status = 'completed';
      await this.completeRequest(id);
    } catch (error: unknown) {
      console.error(`[${new Date().toISOString()}] Error processing request ${id}:`, error);
      await this.mutex.runExclusive(() => {
        const item = this.processing.get(id);
        if (item) {
          item.status = 'error';
          item.result = { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
          this.completedItems.set(id, item);
          this.processing.delete(id);
        }
      });
    } finally {
      await this.mutex.runExclusive(() => {
        this.processing.delete(id);
      });
      console.log(`[${new Date().toISOString()}] Finished processing ${id}. Current processing: ${this.processing.size}, Queue length: ${this.queue.length}`);
      setImmediate(() => this.processQueue());
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
    if (this.completedItems.has(id)) return 'completed';
    const item = this.completedItems.get(id);
    return item?.status === 'error' ? 'error' : 'not_found';
  }

  getResult(id: string): ChatState | { error: string } | null {
    const completedItem = this.completedItems.get(id);
    if (completedItem && completedItem.result) {
      if (typeof completedItem.result === 'object' && 'error' in completedItem.result) {
        return { error: completedItem.result.error };
      }
      return completedItem.result as ChatState;
    }
    return null;
  }

  cleanup() {
    const now = Date.now();
    this.completedItems.forEach((value, key) => {
      if (now - value.timestamp > this.COMPLETED_ITEM_TTL) {
        this.completedItems.delete(key);
      }
    });
  }

  getTotalQueueLength(): number {
    return this.queue.length + this.processing.size;
  }
}