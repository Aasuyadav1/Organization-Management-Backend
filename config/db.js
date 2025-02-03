import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("db connection successful");
  } catch (error) {
    console.log("db connection failed: " + error.message);
  }
};

export default connectDb;