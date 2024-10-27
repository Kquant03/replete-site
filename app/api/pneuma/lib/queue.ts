import { Mutex } from 'async-mutex';
import { generateUniqueId } from './generateUniqueId';
import { processChatRequest } from './aiProcessing';
import type { 
  ChatState,
  UserSettings,
  QueueItem,
  QueueItemType,
  ProcessedChatResult,
  ErrorResult,
  QueueResult
} from '../../../types';

export class Queue {
  private queue: QueueItem[] = [];
  private processing: Map<string, QueueItem> = new Map();
  private completedItems: Map<string, QueueItem> = new Map();
  private COMPLETED_ITEM_TTL = 60000;
  private totalRequestsReceived = 0;
  private mutex = new Mutex();

  constructor(private MAX_CONCURRENT_REQUESTS: number) {}

  private isProcessedChatResult(result: QueueResult): result is ProcessedChatResult {
    return 'messages' in result && 'systemPrompt' in result;
  }

  private isErrorResult(result: QueueResult): result is ErrorResult {
    return 'error' in result;
  }

  async enqueue(
    chatState: ChatState, 
    userInput: string, 
    userName: string, 
    isRegeneration: boolean = false, 
    editedMessageId: string | null = null, 
    userSettings: UserSettings,
    usePreDefinedPrompt: boolean,
    type: QueueItemType = 'chat'
  ): Promise<{ id: string; position: number }> {
    return await this.mutex.runExclusive(() => {
      const id = generateUniqueId();
      this.totalRequestsReceived++;

      const isNewConversation = chatState.messages.length === 0;
      
      console.log('Enqueueing request:', {
        id,
        type,
        messageCount: chatState.messages.length,
        isNewConversation,
        shouldGenerateTitle: isNewConversation || chatState.messages.length % 10 === 0
      });

      const item: QueueItem = { 
        id, 
        type,
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
  
      // For edited messages, ensure we're using the correct message set
      if (item.editedMessageId) {
        const editIndex = item.chatState.messages.findIndex(m => m.id === item.editedMessageId);
        if (editIndex !== -1) {
          // Only keep messages up to and including the edited message
          item.chatState.messages = item.chatState.messages.slice(0, editIndex + 1);
          // Update the edited message content
          item.chatState.messages[editIndex] = {
            ...item.chatState.messages[editIndex],
            content: item.userInput
          };
        }
      }
  
      const messageCount = item.chatState.messages.length;
      const isNewConversation = messageCount === 0 || !item.chatState.messages.some(m => m.role === 'assistant');
      const turnCount = Math.floor(messageCount / 2);
  
      const shouldGenerateTitle = 
        item.type === 'title' || 
        isNewConversation ||
        (turnCount > 0 && turnCount % 5 === 0);
  
      // Log the state of messages before processing
      console.log('Messages before processing:', {
        messageCount,
        messages: item.chatState.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content.substring(0, 50) + '...'
        }))
      });
  
      const result = await processChatRequest(
        item.chatState,
        item.userInput,
        item.userName,
        item.isRegeneration,
        item.editedMessageId,
        item.userSettings,
        item.usePreDefinedPrompt,
        shouldGenerateTitle
      );
  
      console.log('Raw process result:', {
        messagesCount: result.messages.length,
        hasSystemPrompt: !!result.systemPrompt,
        hasTitle: !!result.title,
        title: result.title,
        shouldHaveGeneratedTitle: shouldGenerateTitle
      });
  
      const processedResult: ProcessedChatResult = {
        messages: result.messages,
        systemPrompt: result.systemPrompt,
        title: result.title // Make sure title is included if present
      };
      
      item.result = processedResult;
      item.status = 'completed';
      
      console.log('Final queue item result:', {
        status: item.status,
        hasResult: true,
        hasTitle: !!processedResult.title,
        title: processedResult.title,
        shouldHaveGeneratedTitle: shouldGenerateTitle
      });
  
      await this.completeRequest(id);
  
    } catch (error: unknown) {
      console.error(`[${new Date().toISOString()}] Error processing request ${id}:`, error);
      await this.mutex.runExclusive(() => {
        const item = this.processing.get(id);
        if (item) {
          item.status = 'error';
          const errorResult: ErrorResult = {
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
          };
          item.result = errorResult;
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
        const completedItem = { ...item, timestamp: Date.now() };
        this.completedItems.set(id, completedItem);
        
        if (completedItem.result && this.isProcessedChatResult(completedItem.result)) {
          console.log('Completed item stored:', {
            id,
            status: completedItem.status,
            hasResult: true,
            hasTitle: !!completedItem.result.title,
            title: completedItem.result.title
          });
        }
        
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

  getResult(id: string): QueueResult | null {
    const completedItem = this.completedItems.get(id);
    if (!completedItem?.result) return null;

    const result = completedItem.result;
    
    if (this.isProcessedChatResult(result)) {
      console.log('Getting result for request:', id, {
        status: completedItem.status,
        isProcessedResult: true,
        hasTitle: !!result.title,
        title: result.title
      });
    } else if (this.isErrorResult(result)) {
      console.log('Getting error result for request:', id, {
        status: completedItem.status,
        isProcessedResult: false,
        error: result.error
      });
    }

    return result;
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