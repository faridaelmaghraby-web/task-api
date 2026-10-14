const mongoose = require('mongoose');

// Fail fast instead of silently queueing queries when there is no connection
mongoose.set('bufferCommands', false);

// Cache the connection so serverless platforms (Vercel) reuse it between requests
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 }).then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
  return cached.conn;
}

module.exports = connectDB;
