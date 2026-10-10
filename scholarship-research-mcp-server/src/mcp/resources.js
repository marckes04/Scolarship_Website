import { Scholarship } from "../models/Scholarship.js";

export function registerResources(server) {
  server.resource(
    "all-scholarships",
    "scholarships://all",
    async (uri) => {
      const scholarships = await Scholarship.find({}).lean();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(scholarships, null, 2),
          },
        ],
      };
    }
  );
}