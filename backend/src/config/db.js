import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/repomind-ai', {
      autoIndex: true, // Auto-build indexes in development/production
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE ERROR] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown monitor
mongoose.connection.on('disconnected', () => {
  console.log('[DATABASE] MongoDB connection disconnected.');
});

export default connectDB;
