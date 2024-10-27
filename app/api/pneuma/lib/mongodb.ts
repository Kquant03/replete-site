import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;

interface MongoErrorType {
  name?: string;
  message: string;
  cause?: unknown;
}

function isMongoError(error: unknown): error is MongoErrorType {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }

  // Remove any existing TLS parameters from the URI
  const baseUri = uri.split('?')[0];
  const params = new URLSearchParams(uri.split('?')[1] || '');
  
  // Only keep essential parameters
  params.set('retryWrites', 'true');
  params.set('w', 'majority');
  
  const cleanUri = `${baseUri}?${params.toString()}`;

  const options: MongoClientOptions = {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    // Let MongoDB driver handle all SSL/TLS settings automatically
  };

  try {
    const client = new MongoClient(cleanUri, options);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error: unknown) {
    if (isMongoError(error)) {
      console.error('MongoDB connection error:', {
        errorName: error.name || 'UnknownError',
        errorMessage: error.message,
        cause: error.cause
      });
    } else {
      console.error('Unknown MongoDB connection error:', error);
    }
    throw error;
  }
}

export function getMongoDb() {
  if (!cachedClient) {
    throw new Error('Please connect to MongoDB first');
  }
  return cachedClient.db(dbName);
}