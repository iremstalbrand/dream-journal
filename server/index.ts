import express from "express";
import cors from "cors"; //Cross-Origin Resource Sharing
import { connectDB } from "./db";
import dreamsRouter from "./routes/dreams";

const PORT = process.env.PORT || 3000;


const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://dream-journal-lemon.vercel.app",
    "https://dream-journal-sable.vercel.app"
  ]
}));

app.get("/health", (req, res) => res.json({ ok: true })); //is the server actually running?"
app.use("/dreams", dreamsRouter);

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

start();