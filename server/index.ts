import express from "express";
import cors from "cors"; //Cross-Origin Resource Sharing
import { connectDB } from "./db";
import dreamsRouter from "./routes/dreams";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true })); //is the server actually running?"
app.use("/dreams", dreamsRouter);

async function start() {
  await connectDB();
  app.listen(3000, () => console.log("Server on http://localhost:3000"));
}

start();