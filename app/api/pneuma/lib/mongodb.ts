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

  const options: MongoClientOptions = {
    maxPoolSize: 1,
    minPoolSize: 1,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  };

  try {
    // Modify connection string to force TLS 1.2
    const modifiedUri = uri.includes('?') 
      ? `${uri}&tls=true&tlsInsecure=false`
      : `${uri}?tls=true&tlsInsecure=false`;

    const client = new MongoClient(modifiedUri, options);
    await client.connect();
    
    await client.db('admin').command({ ping: 1 });
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