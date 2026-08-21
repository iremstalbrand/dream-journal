//this file is a one-time script that populates the database with some example dreams, so that the app has something to show when I first run it.
//Big picture of this file: it's a script that connects → wipes old sample data → validates fresh sample data against the Zod rules → inserts it → disconnects. It's a nice full-circle example of shared/types.ts (validation), Dream.ts (database shape), and db.ts (connection) all working together.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { Dream } from "./models/Dream";
import { NewDreamSchema } from "../shared/types";
import dreams from "./data/seed-dreams.json";

const DEMO_USER_ID = "seed-user";
async function seed() {
  await connectDB();

//delete any existing dreams for the demo user, so we don't get duplicates if we run this script multiple times.
  await Dream.deleteMany({ userId: DEMO_USER_ID });

  const valid = dreams.map((d) => NewDreamSchema.parse(d));

  await Dream.insertMany(
    valid.map((d) => ({ ...d, userId: DEMO_USER_ID }))
  );

  console.log(`Inserted ${valid.length} dreams`);
  await mongoose.disconnect();
}

seed();