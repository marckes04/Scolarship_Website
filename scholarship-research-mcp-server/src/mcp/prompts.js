export function registerPrompts(server) {
  server.prompt(
    "scholarship-search-strategy",
    "Generates an actionable strategy to find matching scholarships based on student profile.",
    {
      fieldOfStudy: {
        description: "Field of study or major (e.g. Computer Science)",
        required: true,
      },
      educationLevel: {
        description: "Current education level (e.g. undergraduate, graduate)",
        required: false,
      },
      gpa: {
        description: "Current cumulative GPA",
        required: false,
      },
    },
    async ({ fieldOfStudy, educationLevel, gpa }) => {
      const gpaText = gpa ? `with a GPA of ${gpa}` : "without specified GPA";
      const levelText = educationLevel || "undergraduate";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I am looking for scholarships for a ${levelText} student majoring in ${fieldOfStudy} ${gpaText}. Please use the available scholarship tools to search for eligible options, retrieve requirements, and draft a plan of application.`,
            },
          },
        ],
      };
    }
  );
}