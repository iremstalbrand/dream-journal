import { readDream } from "../gemini";
import { Router } from "express";
import { getAuth } from "@clerk/express";
import { Dream } from "../models/Dream";
import { NewDreamSchema } from "../../shared/types";

const router = Router();

router.use((req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.locals.userId = userId;
  next();
});

router.get("/", async (req, res) => {
  try {
    const dreams = await Dream.find({ userId: res.locals.userId }).sort({ date: -1 });
    res.status(200).json(dreams);
  } catch (error) {
    console.error("Error getting dreams:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: res.locals.userId,
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    res.status(200).json(dream);
  } catch (error) {
    console.error("Error getting dream:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = NewDreamSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const dream = await Dream.create({ ...result.data, userId: res.locals.userId });
    res.status(201).json(dream);
  } catch (error) {
    console.error("Error creating dream:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/reading", async (req, res) => {
  try {
    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: res.locals.userId,
    });

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    const reading = await readDream(dream.text);

    dream.reading = reading;
    await dream.save();

    res.status(200).json(dream);
  } catch (error) {
    console.error("Error reading dream:", error);
    res.status(502).json({ error: "reading_failed" });
  }
});

export default router;