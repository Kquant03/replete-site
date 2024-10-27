import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';

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

  // Set Node.js TLS settings

  const options: MongoClientOptions = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    ssl: true,
    tls: true,
    tlsCAFile: undefined, // Let MongoDB driver handle CA certificates
    connectTimeoutMS: 5000,
  };

  try {
    const client = new MongoClient(uri, options);
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