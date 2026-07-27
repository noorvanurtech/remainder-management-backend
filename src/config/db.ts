import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
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
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
