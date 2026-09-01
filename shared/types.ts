//one shared rulebook that bot frontend and backend import from, so they never disagree about what a "dream" looks like.
import { z } from "zod";

// The four dream types. The dreamer picks one at entry — never the AI.
export const DreamType = z.enum(["ordinary", "vivid", "nightmare", "lucid"]);

// Jung's archetypes as a closed list. The model cannot invent new ones —
// anything outside this list fails validation and never reaches the database.
//z.enum([...]) means "this value must be exactly one of these strings, nothing else."
export const Archetype = z.enum([
  "the shadow",
  "the anima",
  "the animus",
  "the mother",
  "the father",
  "the child",
  "the trickster",
  "the wise old man",
  "the self",
  "the persona",
  "the unconscious",
]);

// One archetype and the short passage written about it.
export const ArchetypeReadingSchema = z.object({
  name: Archetype,
  reading: z.string().min(1).max(400),
});

// The full shape we expect back from Gemini.
export const DreamReadingSchema = z.object({
  lens: z.literal("jung"),
  archetypes: z.array(ArchetypeReadingSchema).min(1).max(3),
});

// A stored dream. `reading` is null until one is requested.
export const DreamSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  date: z.string(),
  type: DreamType,
  text: z.string().min(1).max(3000),
  reading: DreamReadingSchema.nullable(),
  createdAt: z.string(),
});

// What the client sends when creating a dream.
// id, userId and createdAt are generated on the server.
export const NewDreamSchema = DreamSchema.pick({
  date: true,
  type: true,
  text: true,
});

// Types are derived from the schemas — never written twice.
export type DreamType = z.infer<typeof DreamType>;
export type Archetype = z.infer<typeof Archetype>;
export type ArchetypeReading = z.infer<typeof ArchetypeReadingSchema>;
export type DreamReading = z.infer<typeof DreamReadingSchema>;
export type Dream = z.infer<typeof DreamSchema>;
export type NewDream = z.infer<typeof NewDreamSchema>;