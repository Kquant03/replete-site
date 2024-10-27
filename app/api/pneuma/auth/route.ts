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
  
  // Add options to handle TLS connection
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    retryWrites: true,
    minPoolSize: 1,
    maxPoolSize: 10
  };

  try {
    // Ensure we're using modern TLS
    const client = await MongoClient.connect(uri, options);
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
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
    
    // Improved error handling
    let errorMessage = 'An error occurred during registration';
    if (error instanceof Error) {
      // Log the detailed error but send a sanitized message to the client
      console.error('Detailed error:', error);
      errorMessage = error.message.includes('SSL') || error.message.includes('TLS') 
        ? 'Database connection error. Please try again later.'
        : 'Registration failed. Please try again.';
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}