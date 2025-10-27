
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("[db.js] MongoDB already connected");
    return;
  }

  console.log("[db.js] Attempting initial DB connection...");
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`[db.js] MongoDB connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("[db.js] Failed to connect to MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;
