/**
 * System Design Interview Tools for Gemini Live WebSocket API
 *
 * SIMPLIFIED: No diagram tools - agent generates Mermaid diagrams as plain text
 * - Agent outputs Mermaid syntax in code blocks: ```mermaid\ngraph LR\n...```
 * - UI extracts and renders Mermaid from agent messages
 * - Only 3 core tools remain
 */

import { INTERVIEW_TOOLS } from './gemini-tools';

/**
 * SYSTEM_DESIGN_TOOLS: Minimal set of tools for system design interviews
 * Total: 3 tools (core interview control only)
 */
export const SYSTEM_DESIGN_TOOLS = [
  {
    functionDeclarations: [
      // Core interview control
      {
        name: "get_interview_mode",
        description: "Get current interview mode (real or practice) and role instructions.",
      },
      {
        name: "end_interview",
        description: "End the interview session and generate the final report. Use this when the candidate says they want to end the interview, says 'I'm done with the interview', 'let's wrap up', 'end the interview', or similar. Always give a brief closing remark before calling this tool.",
      },
      {
        name: "read_transcript",
        description: "Read the conversation transcript to review what has been said. Use this if you're confused about previous conversation, need to recall what was discussed, or after reconnection.",
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

/**
 * Fallback: Use INTERVIEW_TOOLS (proven to work with Gemini Live API)
 * If tools are rejected, fall back to standard interview tools.
 * Agent can still conduct voice interview.
 */
export const SYSTEM_DESIGN_TOOLS_FALLBACK = INTERVIEW_TOOLS;
