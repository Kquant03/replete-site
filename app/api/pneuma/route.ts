import { NextRequest, NextResponse } from 'next/server';
import { Mutex } from 'async-mutex';
import axios from 'axios';
import { generateUniqueId } from './generateUniqueId';
import { initializeTokenizer, countTokens, estimateTokens } from './fastTokenizer';
import { createLogger, format, transports } from 'winston';

const TABBY_API_URL = process.env.TABBY_API_URL || 'http://localhost:5000';
const TABBY_API_KEY = process.env.TABBY_API_KEY;
const AI_NAME = process.env.AI_NAME || "Pneuma";
const REQUEST_TIMEOUT = 60000; // 60 seconds

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const api = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TABBY_API_KEY}`
  }
});

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type UserSettings = {
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  min_p: number;
  top_k: number;
};

type QueueItem = {
  id: string;
  messages: Message[];
  userInput: string;
  userName: string;
  userSettings: UserSettings;
  isRegeneration: boolean;
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: { response: string; systemPrompt: string };
  timestamp: number;
};

class Queue {
  private queue: QueueItem[] = [];
  private processing: QueueItem | null = null;
  private completed: Map<string, QueueItem> = new Map();
  private mutex = new Mutex();
  private COMPLETED_ITEM_TTL = 60000; // Keep completed items for 1 minute
  private TOKEN_LIMIT = 6200;

  async enqueue(item: Omit<QueueItem, 'id' | 'status' | 'timestamp'>): Promise<{ id: string; position: number }> {
    return this.mutex.runExclusive(() => {
      const id = generateUniqueId();
      const queueItem: QueueItem = {
        ...item,
        id,
        status: 'queued',
        timestamp: Date.now()
      };
      this.queue.push(queueItem);
      const position = this.queue.length;
      logger.info(`Enqueued request ${id} at position ${position}`);
      this.processQueue();
      return { id, position };
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    const item = this.queue.shift()!;
    this.processing = { ...item, status: 'processing' };

    try {
      logger.info(`Processing request ${item.id}`);
      const result = await this.processRequest(item);
      this.processing.result = result;
      this.processing.status = 'completed';
      logger.info(`Completed request ${item.id}`);
      this.completed.set(item.id, this.processing);
      setTimeout(() => this.completed.delete(item.id), this.COMPLETED_ITEM_TTL);
    } catch (error) {
      logger.error(`Error processing request ${item.id}:`, error);
      this.processing.status = 'error';
      this.processing.result = { response: 'An error occurred while processing your request.', systemPrompt: '' };
      this.completed.set(item.id, this.processing);
      setTimeout(() => this.completed.delete(item.id), this.COMPLETED_ITEM_TTL);
    } finally {
      setTimeout(() => {
        this.processing = null;
        this.processQueue();
      }, 0);
    }
  }

  private async processRequest(item: QueueItem): Promise<{ response: string; systemPrompt: string }> {
    const prunedMessages = await this.pruneMessages(item.messages);
    const systemPrompt = await this.generateSystemPrompt(prunedMessages, item.userSettings);
    const response = await this.generateResponse(prunedMessages, item.userInput, item.userName, systemPrompt, item.userSettings);
    return { response, systemPrompt };
  }

  private async pruneMessages(messages: Message[]): Promise<Message[]> {
    let totalTokens = await estimateTokens(messages, '');
    const prunedMessages = [...messages];

    while (totalTokens > this.TOKEN_LIMIT && prunedMessages.length > 2) {
      prunedMessages.shift();
      totalTokens = await estimateTokens(prunedMessages, '');
    }

    logger.info(`Pruned messages from ${messages.length} to ${prunedMessages.length}`);
    return prunedMessages;
  }

  private async generateSystemPrompt(messages: Message[], userSettings: UserSettings): Promise<string> {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const systemPromptRequest = `${prompt}\n\nGenerate a system prompt for ${AI_NAME}, a female AI assistant, based on the conversation history above. The prompt should be concise and reflect ${AI_NAME}'s current state of mind, thoughts, and intentions:`;

    const response = await api.post(`${TABBY_API_URL}/v1/completions`, {
      model: "turbcat",
      prompt: systemPromptRequest,
      ...userSettings,
      max_tokens: 150
    });

    return response.data.choices[0].text.trim();
  }

  private async generateResponse(messages: Message[], userInput: string, userName: string, systemPrompt: string, userSettings: UserSettings): Promise<string> {
    const prompt = `${systemPrompt}\n\n${messages.map(m => `${m.role === 'user' ? userName : AI_NAME}: ${m.content}`).join('\n')}\n${userName}: ${userInput}\n${AI_NAME}:`;

    const response = await api.post(`${TABBY_API_URL}/v1/completions`, {
      model: "turbcat",
      prompt: prompt,
      ...userSettings
    });

    return response.data.choices[0].text.trim();
  }

  getPosition(id: string): number {
    const position = this.queue.findIndex(item => item.id === id);
    if (position !== -1) return position + 1;
    if (this.processing?.id === id) return 0;
    if (this.completed.has(id)) return 0;
    return -1;
  }

  getStatus(id: string): QueueItem['status'] | 'not_found' {
    if (this.processing?.id === id) return this.processing.status;
    const queueItem = this.queue.find(item => item.id === id);
    if (queueItem) return queueItem.status;
    const completedItem = this.completed.get(id);
    if (completedItem) return completedItem.status;
    return 'not_found';
  }

  getResult(id: string): { response: string; systemPrompt: string } | null {
    if (this.processing?.id === id) return this.processing.result || null;
    const completedItem = this.completed.get(id);
    return completedItem ? completedItem.result || null : null;
  }

  getTotalQueueLength(): number {
    return this.queue.length + (this.processing ? 1 : 0);
  }

  deleteLastTurn(messages: Message[]): Message[] {
    const lastUserIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserIndex === -1) return messages;
    return messages.slice(0, lastUserIndex);
  }
}

const globalQueue = new Queue();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    logger.info('Received POST request:', body);

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { messages, userInput, userName, userSettings, isRegeneration, action } = body;

    if (action === 'deleteLast') {
      const updatedMessages = globalQueue.deleteLastTurn(messages);
      return NextResponse.json({ messages: updatedMessages });
    }

    if (!Array.isArray(messages) || typeof userInput !== 'string' || typeof userName !== 'string' || !userSettings) {
      throw new Error('Invalid request parameters');
    }

    const { id, position } = await globalQueue.enqueue({
      messages,
      userInput,
      userName,
      userSettings,
      isRegeneration: isRegeneration || false
    });

    return NextResponse.json({ 
      requestId: id, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error: unknown) {
    logger.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  try {
    const status = globalQueue.getStatus(requestId);
    const position = globalQueue.getPosition(requestId);

    logger.info(`GET request for ${requestId}: Status: ${status}, Position: ${position}`);

    if (status === 'completed' || status === 'error') {
      const result = globalQueue.getResult(requestId);
      if (result) {
        return NextResponse.json({ 
          status, 
          queuePosition: 0, 
          result,
          totalQueueLength: globalQueue.getTotalQueueLength()
        });
      } else {
        return NextResponse.json({ 
          status,
          error: "Result not found, but request was processed. This may be due to an internal error.",
          totalQueueLength: globalQueue.getTotalQueueLength()
        }, { status: 500 });
      }
    } else if (status === 'not_found') {
      return NextResponse.json({ 
        status: 'not_found',
        error: "Request not found. It may have expired or never existed.",
        totalQueueLength: globalQueue.getTotalQueueLength()
      }, { status: 404 });
    }

    // If status is 'queued' or 'processing'
    return NextResponse.json({ 
      status, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error: unknown) {
    logger.error(`Error checking queue position for ${requestId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Initialize the tokenizer
initializeTokenizer().catch(error => logger.error("Error initializing tokenizer:", error));

logger.info('Route initialized');