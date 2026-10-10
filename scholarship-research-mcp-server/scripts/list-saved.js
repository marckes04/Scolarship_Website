import { connectDatabase } from "../src/db.js";
import { Scholarship } from "../src/models/Scholarship.js";
import { SavedScholarship } from "../src/models/savedScolarship.js";
import { ResearchNote } from "../src/models/researchNote.js";

const RESEARCHER_ID = "default";

async function main() {
  const connection = await connectDatabase();

  // Becas guardadas por el investigador, con los datos de la beca (populate)
  const saved = await SavedScholarship.find({ researcherId: RESEARCHER_ID })
    .populate("scholarship")
    .sort({ updatedAt: -1 })
    .lean();

  if (saved.length === 0) {
    console.log("No tienes becas guardadas todavía.");
    await connection.close();
    return;
  }

  // Traer todas las notas del investigador y agruparlas por id de beca
  const notes = await ResearchNote.find({ researcherId: RESEARCHER_ID }).lean();
  const notesByScholarship = new Map();
  for (const note of notes) {
    const key = note.scholarship.toString();
    if (!notesByScholarship.has(key)) notesByScholarship.set(key, []);
    notesByScholarship.get(key).push(note);
  }

  console.log(`Becas guardadas (${saved.length}):\n`);

  saved.forEach((item, index) => {
    const s = item.scholarship;
    const relatedNotes = notesByScholarship.get(s._id.toString()) ?? [];

    console.log(`${index + 1}. ${s.title}`);
    console.log(`   Proveedor:  ${s.provider}`);
    console.log(`   Áreas:      ${(s.fieldsOfStudy ?? []).join(", ")}`);
    console.log(`   Monto:      ${s.amountMin}-${s.amountMax} ${s.currency}`);
    console.log(`   Prioridad:  ${item.priority.toUpperCase()}`);
    console.log(`   Estado:     ${item.status}`);
    console.log(`   URL:        ${s.applicationUrl}`);

    if (relatedNotes.length === 0) {
      console.log(`   Notas:      (sin notas asociadas)`);
    } else {
      console.log(`   Notas (${relatedNotes.length}):`);
      relatedNotes.forEach((n) => console.log(`     - "${n.body}"`));
    }
    console.log("");
  });

  await connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
