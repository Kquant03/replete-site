import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const client = await connectToMongoDB();
    const db = client.db(process.env.MONGODB_DB);

    // Check if username already exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' }, 
        { status: 409 }
      );
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
  }
}