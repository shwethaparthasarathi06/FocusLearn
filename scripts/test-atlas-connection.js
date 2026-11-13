/**
 * test-atlas-connection.js
 * Quick standalone test to verify MongoDB Atlas connectivity.
 * Does NOT modify any data — read-only operations only.
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  // Mask credentials for safe logging
  const masked = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  console.log(`[Test] Connecting to: ${masked}`);
  console.log('[Test] Attempting connection (timeout: 10s)...\n');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    const host = conn.connection.host;
    const dbName = conn.connection.name;
    const readyState = conn.connection.readyState; // 1 = connected

    console.log('✅ MongoDB Atlas connection SUCCESSFUL!');
    console.log(`   Host:        ${host}`);
    console.log(`   Database:    ${dbName}`);
    console.log(`   Ready State: ${readyState} (1 = connected)`);

    // List existing collections (read-only check)
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length === 0 ? '(none — fresh database)' : collections.map(c => c.name).join(', ')}`);

    await mongoose.disconnect();
    console.log('\n[Test] Disconnected cleanly. Atlas is ready to use! 🎉');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ MongoDB Atlas connection FAILED!');
    console.error(`   Error: ${err.message}`);
    if (err.message.includes('ENOTFOUND')) {
      console.error('   → Check your cluster URL in the connection string.');
    } else if (err.message.includes('Authentication failed') || err.message.includes('auth')) {
      console.error('   → Check your Atlas database username and password.');
    } else if (err.message.includes('IP') || err.message.includes('network')) {
      console.error('   → Check that your IP is whitelisted in Atlas Network Access.');
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();

