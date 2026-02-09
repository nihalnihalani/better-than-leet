/**
 * Behavioral Interview Tools for Gemini Live WebSocket API
 * Minimal set: interview control + transcript reading only
 */
export const BEHAVIORAL_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "get_interview_mode",
        description: "Get current interview mode and role instructions.",
      },
      {
        name: "end_interview",
        description: "End the interview session and generate the final report. Use this when the candidate says they want to end the interview, says 'I'm done', 'let's wrap up', 'end the interview', or similar. Always give a brief closing remark before calling this tool.",
      },
      {
        name: "read_transcript",
        description: "Read the conversation transcript to review what has been said. Use this if you need to recall what was discussed or after reconnection.",
        parameters: {
          type: "object",
          properties: {
            last_n_messages: {
              type: "number",
              description: "Number of recent messages to retrieve (default: 20)",
            },
          },
        },
      },
    ],
  },
];
