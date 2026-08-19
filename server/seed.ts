import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { Dream } from "./models/Dream";
import { NewDreamSchema } from "../shared/types";
import dreams from "./data/seed-dreams.json";

const DEMO_USER_ID = "seed-user";

async function seed() {
  await connectDB();


  await Dream.deleteMany({ userId: DEMO_USER_ID });

  const valid = dreams.map((d) => NewDreamSchema.parse(d));

  await Dream.insertMany(
    valid.map((d) => ({ ...d, userId: DEMO_USER_ID }))
  );

  console.log(`Inserted ${valid.length} dreams`);
  await mongoose.disconnect();
}

seed();