//A small standalone script that checks your sample JSON data against the Zod rules and reports problems, without touching the database at all.
//parse vs safeParse: parse throws an error if the data is invalid, while safeParse returns a result object with a success boolean and an error object if it failed.
import dreams from "./data/seed-dreams.json";
import { NewDreamSchema } from "../shared/types.ts";

dreams.forEach((d, i) => {
  const result = NewDreamSchema.safeParse(d);
  if (!result.success) {
    console.log(`Row ${i} failed:`, result.error.issues);
  }
});

console.log(`Checked ${dreams.length} dreams`);