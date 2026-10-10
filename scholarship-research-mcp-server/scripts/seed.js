import fs from "fs";
import { connectDatabase } from "../src/db.js";
import { Scholarship } from "../src/models/Scholarship.js";

async function seed() {
  const connection = await connectDatabase();
  const raw = fs.readFileSync(new URL("../data/scholarships.json", import.meta.url), "utf-8");
  const data = JSON.parse(raw);

  await Scholarship.deleteMany({});
  await Scholarship.insertMany(data);
  console.log(`Seeded ${data.length} scholarships into MongoDB.`);

  await connection.close();
}

seed().catch(console.error);