import { connectDatabase } from "../src/db.js";
import { Scholarship } from "../src/models/Scholarship.js";
import { SavedScholarship } from "../src/models/savedScolarship.js";
import { ResearchNote } from "../src/models/researchNote.js";

const RESEARCHER_ID = "default";
const NOTE_BODY = "Revisar requisitos de ensayo antes de la fecha límite";

async function main() {
  const connection = await connectDatabase();

  // 1. Buscar una beca de Computer Science (case-insensitive)
  const scholarship = await Scholarship.findOne({
    fieldsOfStudy: { $in: [/computer science/i] },
  });

  if (!scholarship) {
    console.error("No se encontró ninguna beca de Computer Science.");
    await connection.close();
    process.exit(1);
  }

  console.log(`Beca encontrada: "${scholarship.title}" (${scholarship._id})`);

  // 2. Guardarla con prioridad alta (upsert para respetar el índice único)
  const saved = await SavedScholarship.findOneAndUpdate(
    { researcherId: RESEARCHER_ID, scholarship: scholarship._id },
    {
      $set: {
        researcherId: RESEARCHER_ID,
        scholarship: scholarship._id,
        priority: "high",
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Guardada con prioridad alta. SavedScholarship id: ${saved._id}`);

  // 3. Agregar la nota de investigación (idempotente: no duplicar si ya existe)
  const existingNote = await ResearchNote.findOne({
    researcherId: RESEARCHER_ID,
    scholarship: scholarship._id,
    body: NOTE_BODY,
  });

  const note =
    existingNote ??
    (await ResearchNote.create({
      researcherId: RESEARCHER_ID,
      scholarship: scholarship._id,
      body: NOTE_BODY,
    }));

  console.log(`Nota de investigación. ResearchNote id: ${note._id}`);
  console.log(`Nota: "${note.body}"`);

  await connection.close();
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
