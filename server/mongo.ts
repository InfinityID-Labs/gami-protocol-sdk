import mongoose from 'mongoose';

// MongoDB connection URL from environment variable
const MONGODB_URI = process.env.MONGODB_URI || '';

// Configuration
mongoose.set('strictQuery', false);

// Flag to check if MongoDB is available
export let isMongoAvailable = false;

/**
 * Connect to MongoDB
 */
export async function connectToMongoDB() {
  // If no MongoDB URI is configured, skip connection
  if (!MONGODB_URI) {
    console.log('No MongoDB URI provided, skipping connection');
    return null;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    isMongoAvailable = true;
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isMongoAvailable = false;
    return null;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromMongoDB() {
  if (!isMongoAvailable) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
    isMongoAvailable = false;
  } catch (err) {
    console.error('MongoDB disconnection error:', err);
    throw err;
  }
}

// Export the mongoose connection
export const mongoConnection = mongoose.connection;

// Handle connection events
mongoConnection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoConnection.once('open', () => {
  console.log('MongoDB connection established');
});

mongoConnection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await disconnectFromMongoDB();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});