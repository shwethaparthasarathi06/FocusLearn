const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connect to MongoDB with automatic dev fallback
 * Tries local/Atlas MongoDB first. If unavailable in development,
 * spins up an in-memory MongoDB instance so the app runs out-of-the-box.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/focuslearn';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to persistent MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return { uri, isMemory: false };
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${err.message}).`);

    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting embedded in-memory MongoDB fallback for development/demo...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: { dbName: 'focuslearn' }
        });
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] Connected to in-memory MongoDB server: ${memUri}`);
        return { uri: memUri, isMemory: true, memoryServer };
      } catch (memErr) {
        console.error('[Database] Failed to initialize in-memory fallback:', memErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  }
}

module.exports = { connectDB };
