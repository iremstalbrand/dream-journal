import mongoose from "mongoose";

const dreamSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  text: { type: String, required: true },
  reading: { type: Object, default: null },
}, { timestamps: true });

export const Dream = mongoose.model("Dream", dreamSchema);