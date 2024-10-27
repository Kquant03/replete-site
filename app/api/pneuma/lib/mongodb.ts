import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;

export async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }

  const options: MongoClientOptions = {
    maxPoolSize: 1,
    minPoolSize: 1,
    maxIdleTimeMS: 5000,
    serverSelectionTimeoutMS: 5000, // Reduced from 10000
    socketTimeoutMS: 5000, // Reduced from 20000
    connectTimeoutMS: 5000, // Added explicit connect timeout
    ssl: true,
    tls: true
  };

  try {
    // Set a timeout for the entire connection attempt
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection attempt timed out'));
      }, 8000); // 8 second timeout
    });

    const connectionPromise = async () => {
      const client = new MongoClient(uri, options);
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      return client;
    };

    // Race between connection and timeout
    const client = await Promise.race([connectionPromise(), timeoutPromise]) as MongoClient;
    
    console.log('Connected successfully to MongoDB');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getMongoDb() {
  if (!cachedClient) {
    throw new Error('Please connect to MongoDB first');
  }
  return cachedClient.db(dbName);
}