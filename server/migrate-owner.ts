import mongoose from "mongoose";
import { connectDB } from "./db";
import { Dream } from "./models/Dream";

const newUserId = process.argv[2];

async function main() {
  if (!newUserId?.startsWith("user_")) {
    console.error("Usage: npx tsx --env-file=.env server/migrate-owner.ts user_xxx");
    process.exit(1);
  }

  await connectDB();

  const result = await Dream.updateMany(
    { userId: "seed-user" },
    { $set: { userId: newUserId } }
  );

  console.log(`Updated ${result.modifiedCount} dreams to ${newUserId}`);
  await mongoose.disconnect();
}

main();