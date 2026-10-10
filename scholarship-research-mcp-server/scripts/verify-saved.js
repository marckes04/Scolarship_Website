import { connectDatabase } from "../src/db.js";
import { Scholarship } from "../src/models/Scholarship.js";
import { SavedScholarship } from "../src/models/savedScolarship.js";
import { ResearchNote } from "../src/models/researchNote.js";

const RESEARCHER_ID = "default";

async function main() {
  const connection = await connectDatabase();

  const csScholarship = await Scholarship.findOne({
    fieldsOfStudy: { $in: [/computer science/i] },
  });

  if (!csScholarship) {
    console.error("No se encontró ninguna beca de Computer Science.");
    await connection.close();
    process.exit(1);
  }

  console.log(`Beca: "${csScholarship.title}" (${csScholarship._id})\n`);

  const saved = await SavedScholarship.find({
    researcherId: RESEARCHER_ID,
    scholarship: csScholarship._id,
  }).lean();
  console.log("--- SavedScholarship ---");
  console.log(JSON.stringify(saved, null, 2));

  const notes = await ResearchNote.find({
    researcherId: RESEARCHER_ID,
    scholarship: csScholarship._id,
  }).lean();
  console.log("\n--- ResearchNote ---");
  console.log(JSON.stringify(notes, null, 2));

  await connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
