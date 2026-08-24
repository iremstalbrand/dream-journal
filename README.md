# Dream Journal

Write a dream. Get a Jungian reading of it. Watch months of entries take shape in 3D.

**The AI proposes, the dreamer decides.**

> Work in progress. Individual project for Hyper Island FED27, in active development.
> The data layer and API are working; the interface is being built.

---

## Problem

Dreams are forgotten within minutes of waking.

The ones that get written down become a wall of text that can't be searched or compared.

And they stay uninterpreted, because reading Jung to decode your own dream is not something you do at 6am.

---

## Solution

**Fast capture.** Pick a dream type, write, save. Under a minute, half-asleep.

**A named lens.** One tap sends the dream to Gemini and returns a Jungian reading, broken into archetypes. The lens is always named on screen, and the reading can be kept or discarded.

**A visible shape.** Every dream becomes a node on a 3D timeline, coloured by type. Frequency, gaps and clusters are visible without reading anything back.

---

## Constraints I set

**The AI never claims to know what a dream means.** Readings use reported speech ("Jung read the mother figure as...") and the line "one reading among many" sits on screen wherever a reading appears.

**Archetypes are a closed set of 11.** The model cannot invent one.

**No streaks, no scores, no notifications.** A month with no dreams is data, not a failure.

---

## How the AI is constrained

Zod enum, shared by client and server:

```ts
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
```

The prompt asks for these. Zod enforces them. Anything outside the list fails validation and never reaches the database.

The same schema generates the TypeScript type used in the React components, so what the model returns and what the screen renders cannot drift apart.

---

## Stack

| Area       | Choice                      |
| ---------- | --------------------------- |
| Language   | TypeScript, end to end      |
| Frontend   | React 19 + Vite, Tailwind 4 |
| 3D         | React Three Fiber + drei    |
| Motion     | Motion                      |
| Backend    | Node + Express              |
| Database   | MongoDB Atlas + Mongoose    |
| Validation | Zod, shared                 |
| AI         | Gemini, behind one route    |
| Auth       | Clerk                       |
| Deploy     | Vercel + Render             |

---

## Structure

```
client/    React app
server/    Express API
shared/    Zod schemas and inferred types, imported by both
```

Monorepo, so `shared/types.ts` is the single source of truth. Change a field on the server and the client stops compiling.

---

## Data

Seeded with sample entries covering a range of dream types and archetypes.
Empty months are left empty, since gaps are part of the pattern.

---

## Running locally

```bash
# Backend
npm install
npm run dev          # http://localhost:3000

# Frontend
cd client
npm install
npm run dev          # http://localhost:5173
```

`.env` in the project root:

```
MONGODB_URI=...
GEMINI_API_KEY=...
```

Seed the database:

```bash
npm run seed
```

---

## Status

Work in progress.

Done:

- Zod schemas, shared between client and server
- MongoDB models and seeding
- Express API with validated archetype output

Next:

- Capture screen and dream list
- Reading route to Gemini
- Auth with Clerk
- 3D timeline

---

## Context

Individual project, Hyper Island FED27. Primary learning goal: TypeScript end to end, from database to components.
