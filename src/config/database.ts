import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) { // Notice the type annotation for error handling
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
