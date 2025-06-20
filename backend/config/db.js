import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://prateekjdelhi2004:r4dmwxRWFj9aUsSX@cluster0.cskfcn6.mongodb.net/taskflow?retryWrites=true&w=majority'
    );
    console.log('DB CONNECTED');
  } catch (error) {
    console.error('DB connection error:', error);
  }
};
