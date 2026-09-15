import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { DreamReadingSchema, Archetype } from "../shared/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ARCHETYPES = Archetype.options.join(", ");

const FIXTURE = {
  lens: "jung" as const,
  archetypes: [
    {
      name: "the mother" as const,
      reading:
        "Jung read the mother figure as ambivalent, nurturing and devouring at once. Encountering her younger than you have ever known her points, in his writing, to a maternal image formed inside the psyche rather than remembered from life. The coat left behind marks her presence continuing after the figure withdraws.",
    },
    {
      name: "the unconscious" as const,
      reading:
        "Still water, in Jung's writing, is the surface of the unconscious. That the lake does not move suggests contents held rather than flowing, and the far shore you cannot make out is the material not yet available to consciousness.",
    },
    {
      name: "the shadow" as const,
      reading:
        "Jung described approaching a threshold without crossing it as a shadow motif. Ground that recedes as you step toward it marks the part of the self that is approached but not met.",
    },
  ],
};

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
- Each "reading" is 2-3 sentences, under 400 characters
- Use reported speech: "Jung read the mother figure as...", "In Jung's writing, still water is..."
- Never write "your unconscious is telling you" or claim what the dream means
- This is one reading among many, not the truth

Dream:
${text}
`;

  try {
    const result = (await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 25000)
      ),
    ])) as Awaited<ReturnType<typeof model.generateContent>>;

    const raw = result.response.text();
    const parsed = JSON.parse(raw);
    return DreamReadingSchema.parse(parsed);
  } catch (error) {
    console.error("Gemini failed:", error);
    if (process.env.USE_FIXTURE === "true") {
      return FIXTURE;
    }
    throw error;
  }
}