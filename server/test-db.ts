import { connectDB } from "./db";

connectDB().then(() => process.exit(0));