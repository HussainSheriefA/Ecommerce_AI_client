const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;
let isAtlasConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const useFallback = process.env.USE_FALLBACK_DB === 'true';

    if (!uri) {
      throw new Error('MONGODB_URI missing in .env');
    }

    // Try to connect to MongoDB Atlas first
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, {
        dbName: process.env.DB_NAME || 'ecommerceai',
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10
      });
      isAtlasConnected = true;
      console.log('✅ MongoDB Atlas Connected:', conn.connection.host);
      console.log('Database:', conn.connection.name);
      return;
    } catch (atlasError) {
      console.error('❌ Atlas connection failed:', atlasError.message);
      
      if (!useFallback) {
        console.error('Fallback disabled. Exiting...');
        process.exit(1);
      }
    }

    // Fallback to local MongoDB if available (persistent)
    const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/ecommerceai';
    try {
      console.log('Trying local MongoDB fallback...', localUri);
      const localConn = await mongoose.connect(localUri, {
        dbName: process.env.DB_NAME || 'ecommerceai',
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10
      });
      console.log('✅ MongoDB Connected (Local):', localConn.connection.host);
      console.log('Database:', localConn.connection.name);
      return;
    } catch (localError) {
      console.warn('⚠️ Local MongoDB not available:', localError.message);
    }

    // Fallback to in-memory database
    console.log('Switching to In-Memory Database...');
    mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    
    const conn = await mongoose.connect(memUri, {
      dbName: process.env.DB_NAME || 'ecommerceai'
    });
    
    console.log('⚡ MongoDB Connected (In-Memory):', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('⚠️  Warning: Data will be lost when server restarts');
  } catch (error) {
    console.error('Database Connection Error:', error.message);
    process.exit(1);
  }
};

// Check if connected to Atlas
const isConnectedToAtlas = () => isAtlasConnected;

// Get connection status
const getConnectionStatus = () => ({
  isAtlas: isAtlasConnected,
  host: mongoose.connection.host,
  name: mongoose.connection.name,
  readyState: mongoose.connection.readyState
});

module.exports = { connectDB, isConnectedToAtlas, getConnectionStatus };