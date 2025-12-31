import { MongoClient } from 'mongodb';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI || 'mongodb://localhost:27017';
console.log('MongoDB URI:', uri);

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  console.log('Creating new MongoDB client...');
  client = new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });
  global._mongoClientPromise = client.connect().catch(err => {
    console.error('MongoDB connection error:', err);
    throw err;
  });
  console.log('MongoDB client created and connecting...');
}
clientPromise = global._mongoClientPromise;

export default clientPromise;