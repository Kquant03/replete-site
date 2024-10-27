import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
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

    // Check if username already exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    });

    return NextResponse.json({ userId: result.insertedId });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}