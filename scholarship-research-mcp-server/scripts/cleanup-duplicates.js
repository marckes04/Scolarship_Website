import { connectDatabase } from "../src/db.js";
import { ResearchNote } from "../src/models/researchNote.js";

// Elimina notas duplicadas dejando solo la más antigua por cada
// combinación (researcherId, scholarship, body).
async function main() {
  const connection = await connectDatabase();

  const notes = await ResearchNote.find({}).sort({ createdAt: 1 }).lean();
  const seen = new Set();
  const duplicates = [];

  for (const note of notes) {
    const key = `${note.researcherId}|${note.scholarship.toString()}|${note.body}`;
    if (seen.has(key)) {
      duplicates.push(note._id);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.length === 0) {
    console.log("No hay notas duplicadas.");
  } else {
    const res = await ResearchNote.deleteMany({ _id: { $in: duplicates } });
    console.log(`Notas duplicadas eliminadas: ${res.deletedCount}`);
  }

  await connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
