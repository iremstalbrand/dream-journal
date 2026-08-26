import { Router } from "express";
import { Dream } from "../models/Dream";
import { NewDreamSchema } from "../../shared/types";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const dreams = await Dream.find({ userId: "seed-user" }).sort({ date: -1 });
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
      userId: "seed-user",
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
    const dream = await Dream.create({ ...result.data, userId: "seed-user" });
    res.status(201).json(dream);
  } catch (error) {
    console.error("Error creating dream:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;