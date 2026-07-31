import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    // Disable Mongoose buffering globally so queries fail fast if DB is not connected
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGO_URI || '', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging indefinitely
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    try {
      // Drop the problematic index to allow recreation with new rules
      await conn.connection.collection('users').dropIndex('phone_1');
      console.log('Dropped legacy phone_1 index');
    } catch (e: any) {
      // Ignore if index doesn't exist
    }

    // Import User model and sync indexes
    const User = (await import('../models/user.model')).default;
    await User.syncIndexes();
    console.log('User indexes synced');

  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
