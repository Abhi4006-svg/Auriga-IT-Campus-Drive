const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beanledger';

  try {
    // Set connection timeout to 3 seconds to quickly fallback if MongoDB is not running locally
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to local MongoDB (${error.message}). Starting MongoMemoryServer...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Successfully connected to in-memory MongoDB at ${inMemoryUri}`);
    } catch (memError) {
      console.error('[Database] Failed to start in-memory MongoDB:', memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
