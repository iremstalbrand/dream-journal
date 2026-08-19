import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env");
}

export async function connectDB() {
  await mongoose.connect(uri!);
  console.log("Connected to MongoDB");
}