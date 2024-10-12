import { NextRequest, NextResponse } from 'next/server';
import { Queue } from './queue';

const MAX_CONCURRENT_REQUESTS = 3;

const globalQueue = new Queue(MAX_CONCURRENT_REQUESTS);

export async function POST(request: NextRequest) {
  console.log('[POST] Received request');
  try {
    const body = await request.json();
    console.log('[POST] Request body:', JSON.stringify(body, null, 2));
    const { chatState, userInput, userName, isRegeneration = false, editedMessageId = null, userSettings } = body;

    if (!chatState || typeof userInput !== 'string' || typeof userName !== 'string' || typeof isRegeneration !== 'boolean' || !userSettings) {
      throw new Error('Invalid request body');
    }

    const { id, position } = await globalQueue.enqueue(chatState, userInput, userName, isRegeneration, editedMessageId, userSettings);

    console.log(`[POST] Enqueued request ${id} at position ${position}`);
    return NextResponse.json({ 
      requestId: id, 
      queuePosition: position,
      totalQueueLength: globalQueue.getTotalQueueLength()
    });
  } catch (error) {
    console.error("[POST] Error processing chat request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('[GET] Received request');
  const requestId = request.nextUrl.searchParams.get('requestId');

  if (!requestId) {
    console.log('[GET] Missing requestId');
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  try {
    const status = globalQueue.getStatus(requestId);
    const position = await globalQueue.getPosition(requestId);

    console.log(`[GET] Request ${requestId} status: ${status}, position: ${position}`);

    if (status === 'completed') {
      const result = globalQueue.getResult(requestId);
      if (result) {
        console.log(`[GET] Returning completed result for request ${requestId}`);
        return NextResponse.json({ 
          status, 
          queuePosition: 0, 
          result,
          totalQueueLength: globalQueue.getTotalQueueLength()
        });
      } else {
        console.log(`[GET] Result not found for completed request ${requestId}`);
        return NextResponse.json({ error: "Result not found" }, { status: 404 });
      }
    } else if (status === 'error') {
      console.log(`[GET] Error status for request ${requestId}`);
      return NextResponse.json({ error: "An error occurred while processing the request" }, { status: 500 });
    } else if (status === 'not_found') {
      console.log(`[GET] Request ${requestId} not found`);
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    } else {
      console.log(`[GET] Returning status update for request ${requestId}`);
      return NextResponse.json({ 
        status, 
        queuePosition: position,
        totalQueueLength: globalQueue.getTotalQueueLength()
      });
    }
  } catch (error) {
    console.error("[GET] Error checking queue position:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Run cleanup every minute
setInterval(() => {
  console.log('[Cleanup] Running queue cleanup');
  globalQueue.cleanup();
}, 60000);

console.log('Route handlers initialized');