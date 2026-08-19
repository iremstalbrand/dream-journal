import dreams from "./data/seed-dreams.json";
import { NewDreamSchema } from "../shared/types.ts";

dreams.forEach((d, i) => {
  const result = NewDreamSchema.safeParse(d);
  if (!result.success) {
    console.log(`Row ${i} failed:`, result.error.issues);
  }
});

console.log(`Checked ${dreams.length} dreams`);