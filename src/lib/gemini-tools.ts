/**
 * Interview Tools for Gemini Live WebSocket API
 * Uses plain JSON format compatible with Live API (not SDK types)
 */
export const INTERVIEW_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "read_candidate_code",
        description: "Read the current code written by the candidate in the code editor. Use this to see what they've typed.",
      },
      {
        name: "run_code",
        description: "Execute the candidate's current code and run tests. Use this when the candidate says 'run it', 'test it', 'execute', or 'I'm done'.",
      },
      {
        name: "get_current_problem",
        description: "Get the current coding problem details including description, examples, and constraints.",
      },
      {
        name: "read_sandbox_file",
        description: "Read a specific file from the sandbox workspace.",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The file path to read",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "install_dependency",
        description: "Install a package in the sandbox environment.",
        parameters: {
          type: "object",
          properties: {
            packageName: {
              type: "string",
              description: "Package name to install",
            },
            manager: {
              type: "string",
              description: "Package manager: 'pip' or 'npm'",
            },
          },
          required: ["packageName", "manager"],
        },
      },
      {
        name: "run_hidden_test",
        description: "Run a specific test case against the candidate's code.",
        parameters: {
          type: "object",
          properties: {
            testCode: {
              type: "string",
              description: "The test code to execute",
            },
          },
          required: ["testCode"],
        },
      },
      {
        name: "get_interview_mode",
        description: "Get current interview mode (real or practice) and role instructions.",
      },
      {
        name: "provide_hint",
        description: "Provide a hint to help the candidate (practice mode only).",
        parameters: {
          type: "object",
          properties: {
            level: {
              type: "number",
              description: "Hint level (0 = first hint, 1 = more specific, etc.)",
            },
          },
        },
      },
      {
        name: "explain_concept",
        description: "Explain a coding concept to the candidate (practice mode only).",
        parameters: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "The concept to explain",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "get_integrity_status",
        description: "Check if candidate has copy-pasted code or switched tabs.",
      },
      {
        name: "end_interview",
        description: "End the interview session and generate the final report. Use this when the candidate says they want to end the interview, says 'I'm done with the interview', 'let's wrap up', 'end the interview', or similar. Always give a brief closing remark before calling this tool.",
      },
    ],
  },
];
