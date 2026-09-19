const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  // If already connected, do not attempt to reconnect
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobconnect-ai';
  
  try {
    // Attempt standard connection with 2-second server selection timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[JobConnect AI] MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[JobConnect AI] Could not connect to external MongoDB at ${uri} (${err.message})`);
    console.log('[JobConnect AI] Starting embedded In-Memory MongoDB server for seamless zero-setup execution...');
    
    try {
      if (!mongod) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
      }
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[JobConnect AI] Embedded In-Memory MongoDB Connected at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[JobConnect AI] Fatal error: Failed to start embedded MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};

module.exports = { connectDB, disconnectDB };
