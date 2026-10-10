import { z } from "zod";
import { Scholarship } from "../models/Scholarship.js";

export function registerTools(server) {
  server.tool(
    "search_scholarships",
    "Search available scholarships by query, education level, or field of study",
    {
      query: z.string().optional().describe("Keywords to search in title or description"),
      educationLevel: z.string().optional().describe("e.g. undergraduate, graduate"),
      fieldOfStudy: z.string().optional().describe("e.g. Computer Science, Engineering"),
    },
    async ({ query, educationLevel, fieldOfStudy }) => {
      const filter = {};

      if (query) {
        filter.$text = { $search: query };
      }
      if (educationLevel) {
        filter.educationLevels = educationLevel;
      }
      if (fieldOfStudy) {
        filter.fieldsOfStudy = fieldOfStudy;
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
}