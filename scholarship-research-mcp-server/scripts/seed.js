import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "../src/db.js";
import { Scholarship } from "../src/models/Scholarship.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log("Iniciando sembrado de becas en MongoDB Atlas...");
  await connectDatabase();

  const dataPath = path.resolve(__dirname, "../data/scholarships.json");
  const rawData = await fs.readFile(dataPath, "utf-8");
  const scholarshipsData = JSON.parse(rawData);

  // Limpiar colección de becas existente para evitar duplicados
  const deleteResult = await Scholarship.deleteMany({});
  console.log(`Colección anterior limpiada (${deleteResult.deletedCount} eliminadas).`);

  // Insertar las nuevas becas
  const inserted = await Scholarship.insertMany(scholarshipsData);
  console.log(`✓ Se insertaron con éxito ${inserted.length} becas en MongoDB Atlas.`);

  console.log("\nListado de becas cargadas:");
  inserted.forEach((s, idx) => {
    console.log(` ${idx + 1}. [${s.fieldsOfStudy.join(", ")}] ${s.title} ($${s.amountMin} - $${s.amountMax} ${s.currency})`);
  });

  process.exit(0);
}

runSeed().catch((error) => {
  console.error("Error durante el seed:", error);
  process.exit(1);
});