import { z } from "zod";
import { Scholarship } from "../models/Scholarship.js";
import { SavedScholarship } from "../models/savedScolarship.js";
import { ResearchNote } from "../models/researchNote.js";

export function registerTools(server) {
  // 1. Buscar becas (Case-Insensitive)
  server.tool(
    "search_scholarships",
    "Search available scholarships by query, education level, or field of study",
    {
      query: z.string().optional().describe("Keywords to search in title or description"),
      educationLevel: z.string().optional().describe("e.g. undergraduate, graduate"),
      fieldOfStudy: z.string().optional().describe("e.g. computer science, engineering"),
    },
    async ({ query, educationLevel, fieldOfStudy }) => {
      const filter = {};

      if (query) {
        filter.$text = { $search: query };
      }
      if (educationLevel) {
        filter.educationLevels = { $regex: new RegExp(educationLevel, "i") };
      }
      if (fieldOfStudy) {
        filter.fieldsOfStudy = { $regex: new RegExp(fieldOfStudy, "i") };
      }

      const results = await Scholarship.find(filter).limit(10).lean();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  // 2. Guardar o actualizar estado de beca
  server.tool(
    "save_scholarship",
    "Save a scholarship to the researcher's list with an optional priority (low, medium, high).",
    {
      scholarshipId: z.string().describe("The id of the scholarship to save"),
      priority: z
        .enum(["low", "medium", "high"])
        .optional()
        .describe("Priority for the saved scholarship. Defaults to medium."),
      researcherId: z.string().optional().describe("Researcher id. Defaults to 'default'."),
    },
    async ({ scholarshipId, priority, researcherId }) => {
      const rid = researcherId ?? "default";

      const saved = await SavedScholarship.findOneAndUpdate(
        { researcherId: rid, scholarship: scholarshipId },
        { $set: { researcherId: rid, scholarship: scholarshipId, priority: priority ?? "medium" } },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(saved, null, 2),
          },
        ],
      };
    }
  );

  // 3. Agregar notas de investigación
  server.tool(
    "add_research_note",
    "Add a research note to a scholarship for a researcher.",
    {
      scholarshipId: z.string().describe("The id of the scholarship to attach the note to"),
      body: z.string().describe("The note content"),
      researcherId: z.string().optional().describe("Researcher id. Defaults to 'default'."),
    },
    async ({ scholarshipId, body, researcherId }) => {
      const note = await ResearchNote.create({
        researcherId: researcherId ?? "default",
        scholarship: scholarshipId,
        body,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(note, null, 2),
          },
        ],
      };
    }
  );

  // 4. Listar becas guardadas junto con los datos de la beca
  server.tool(
    "list_saved_scholarships",
    "List all saved scholarships along with their full details and current priority/status.",
    {
      researcherId: z.string().optional().describe("Researcher id. Defaults to 'default'."),
    },
    async ({ researcherId }) => {
      const rid = researcherId ?? "default";
      const saved = await SavedScholarship.find({ researcherId: rid })
        .populate("scholarship")
        .lean();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(saved, null, 2),
          },
        ],
      };
    }
  );

  // 5. Listar notas asociadas a una beca
  server.tool(
    "list_research_notes",
    "List all research notes associated with a specific scholarship.",
    {
      scholarshipId: z.string().describe("The id of the scholarship"),
      researcherId: z.string().optional().describe("Researcher id. Defaults to 'default'."),
    },
    async ({ scholarshipId, researcherId }) => {
      const filter = { scholarship: scholarshipId };
      if (researcherId) {
        filter.researcherId = researcherId;
      }

      const notes = await ResearchNote.find(filter).sort({ createdAt: -1 }).lean();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(notes, null, 2),
          },
        ],
      };
    }
  );
}