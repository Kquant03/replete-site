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

  try {
    const client = await MongoClient.connect(uri);
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const { username, password } = await request.json();

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
    return NextResponse.json(
      { error: 'An error occurred during registration' }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}