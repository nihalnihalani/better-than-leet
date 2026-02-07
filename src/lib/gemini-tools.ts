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
 * Diagram tool declarations (to be merged into INTERVIEW_TOOLS for system design mode).
 * Single batched tool for efficient diagram updates.
 */
const DIAGRAM_DECLARATIONS = [
  {
    name: "update_diagram",
    description: "Update the architecture diagram with batched operations (add/remove/update nodes and edges). This is more efficient than individual operations and reduces errors.",
    parameters: {
      type: "object",
      properties: {
        add_nodes: {
          type: "array",
          description: "Array of nodes to add to the diagram",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique kebab-case ID like api-server or redis-cache",
              },
              type: {
                type: "string",
                description: "One of: service, database, cache, queue, loadbalancer, cdn, storage, client, worker",
              },
              label: {
                type: "string",
                description: "Display label like API Server or Redis Cache",
              },
              subtitle: {
                type: "string",
                description: "Optional subtitle for additional context",
              },
            },
            required: ["id", "type", "label"],
          },
        },
        add_edges: {
          type: "array",
          description: "Array of edges (connections) to add between existing nodes",
          items: {
            type: "object",
            properties: {
              from: {
                type: "string",
                description: "Source node ID",
              },
              to: {
                type: "string",
                description: "Target node ID",
              },
              label: {
                type: "string",
                description: "Connection label like HTTP, gRPC, or Reads/Writes",
              },
            },
            required: ["from", "to"],
          },
        },
        remove_nodes: {
          type: "array",
          description: "Array of node IDs to remove (their edges will be removed too)",
          items: {
            type: "string",
          },
        },
        update_nodes: {
          type: "array",
          description: "Array of node updates to modify existing nodes",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "ID of the node to update",
              },
              label: {
                type: "string",
                description: "New label",
              },
              subtitle: {
                type: "string",
                description: "New subtitle",
              },
            },
            required: ["id"],
          },
        },
      },
    },
  },
  {
    name: "read_diagram",
    description: "Read the current state of the architecture diagram. Returns all nodes and edges. Call this after reconnection to see what's already been drawn.",
  },
];

/**
 * System Design Tools: Minimal set of tools relevant for system design interviews.
 * Only includes tools the agent actually needs in system design mode.
 * This reduces the model's decision-making overhead compared to including all 14 interview tools.
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
      // Diagram tools
      ...DIAGRAM_DECLARATIONS,
    ],
  },
];

/**
 * Minimal fallback tools for system design mode.
 * Used when both SYSTEM_DESIGN_TOOLS and INTERVIEW_TOOLS are rejected by the Live API.
 * Contains only the simplest tools with no complex parameter schemas.
 */
export const MINIMAL_SYSTEM_DESIGN_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "get_interview_mode",
        description: "Get current interview mode (real or practice) and role instructions.",
      },
      {
        name: "end_interview",
        description: "End the interview session and generate the final report.",
      },
      {
        name: "read_transcript",
        description: "Read the last 20 messages of the conversation transcript.",
      },
      {
        name: "read_diagram",
        description: "Read the current state of the architecture diagram.",
      },
    ],
  },
];
