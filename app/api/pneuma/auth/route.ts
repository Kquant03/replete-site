import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const client = await connectToMongoDB();
    const db = client.db(process.env.MONGODB_DB);
    
    const user = await db.collection('users').findOne({ username });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' }, 
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' }, 
        { status: 401 }
      );
    }

    return NextResponse.json({ userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' }, 
      { status: 500 }
    );
  }
}