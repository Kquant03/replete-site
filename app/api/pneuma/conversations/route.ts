import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

async function connectToDatabase() {
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  try {
    return await MongoClient.connect(uri);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

// Validate ObjectId
function isValidObjectId(id: string): boolean {
  try {
    new ObjectId(id);
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (!id && !userId) {
    return NextResponse.json({ error: 'Either id or userId must be provided' }, { status: 400 });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(dbName);

    if (id) {
      if (!isValidObjectId(id)) {
        return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 });
      }

      const conversation = await db.collection('conversations').findOne({ 
        _id: new ObjectId(id)
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json(conversation);
    } else if (userId) {
      const conversations = await db.collection('conversations')
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('GET conversation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching conversations' }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const newConversation = await request.json();

    if (!newConversation.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    client = await connectToDatabase();
    const db = client.db(dbName);

    const result = await db.collection('conversations').insertOne({
      ...newConversation,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      insertedId: result.insertedId,
      ...newConversation 
    });
  } catch (error) {
    console.error('POST conversation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the conversation' }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function PUT(request: NextRequest) {
  let client;
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 });
    }

    client = await connectToDatabase();
    const db = client.db(dbName);

    const result = await db.collection('conversations').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('PUT conversation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the conversation' }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(dbName);

    const result = await db.collection('conversations').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('DELETE conversation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the conversation' }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}