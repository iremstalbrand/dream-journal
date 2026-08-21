//this tells MongoDB what a "dream" document looks like when its saved to db.
//mongoose is the library that lets us talk to MongoDB.
//Mongoose isn't doing the same rigorous validation Zod does; the assumption is that data gets validated by Zod before it ever reaches this database layer.
import mongoose from "mongoose"; 

const dreamSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  text: { type: String, required: true },
  reading: { type: Object, default: null },
}, { timestamps: true });

export const Dream = mongoose.model("Dream", dreamSchema);