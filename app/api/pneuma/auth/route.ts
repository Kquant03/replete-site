import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

async function connectToDatabase() {
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  return await MongoClient.connect(uri);
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(dbName);

    const user = await db.collection('users').findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    return NextResponse.json({ userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(request: NextRequest) {
  const { userId, password } = await request.json();

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(dbName);

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Delete user
    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    // Delete user's conversations
    await db.collection('conversations').deleteMany({ userId: userId });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ message: 'An error occurred while deleting the account' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}