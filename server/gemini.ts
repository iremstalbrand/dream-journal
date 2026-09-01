import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { DreamReadingSchema, Archetype } from "../shared/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ARCHETYPES = Archetype.options.join(", ");

export async function readDream(text: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
Read this dream through the lens of Carl Jung's writing.

Return ONLY JSON in this exact shape:
{
  "lens": "jung",
  "archetypes": [
    { "name": "the mother", "reading": "..." }
  ]
}

Rules:
- Between 1 and 3 archetypes, no more
- "name" must be one of: ${ARCHETYPES}
- Each "reading" is 2-3 sentences, under 500 characters
- Use reported speech: "Jung read the mother figure as...", "In Jung's writing, still water is..."
- Never write "your unconscious is telling you" or claim what the dream means
- This is one reading among many, not the truth
- Ensure normal spacing between all words

Dream:
${text}
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const parsed = JSON.parse(raw);

  return DreamReadingSchema.parse(parsed);
}