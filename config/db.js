import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("DataBase connection is successful'");
  } catch (error) {
    console.error('DataBase is not successfully connected:', error);
    process.exit(1);
  }
};
