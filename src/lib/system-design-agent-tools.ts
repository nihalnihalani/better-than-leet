/**
 * System Design Interview Tool Handlers
 * SIMPLIFIED: Only core interview control tools, no diagram tools
 * Diagrams are generated as Mermaid syntax in agent text output
 */

import { useSystemDesignStore } from './system-design-store';

// Wrapper to catch tool errors and prevent disconnections
const wrapTool = (name: string, fn: Function) => async (...args: any[]) => {
    try {
        console.log(`🔧 Tool called: ${name}`, args.length > 0 ? args[0] : '(no args)');
        const result = await fn(...args);
        console.log(`✅ Tool ${name} succeeded`);
        return result;
    } catch (error) {
        console.error(`❌ Tool ${name} failed:`, error);
        return `Error in ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};

// Stub response for interview-only tools that exist in the shared tool set
// but aren't relevant for system design mode
const SD_STUB = "This tool is not available in system design mode.";

export const getSystemDesignTools = () => ({
    // Stubs for interview-only tools (Gemini may try to call them since they're in the tool set)
    read_candidate_code: wrapTool('read_candidate_code', async () => SD_STUB),
    run_code: wrapTool('run_code', async () => SD_STUB),
    get_current_problem: wrapTool('get_current_problem', async () => SD_STUB),
    read_sandbox_file: wrapTool('read_sandbox_file', async () => SD_STUB),
    install_dependency: wrapTool('install_dependency', async () => SD_STUB),
    run_hidden_test: wrapTool('run_hidden_test', async () => SD_STUB),
    provide_hint: wrapTool('provide_hint', async () => SD_STUB),
    explain_concept: wrapTool('explain_concept', async () => SD_STUB),
    get_integrity_status: wrapTool('get_integrity_status', async () => SD_STUB),

    get_interview_mode: wrapTool('get_interview_mode', async () => {
        console.log("Agent requested interview mode info");
        return JSON.stringify({
            mode: 'system-design',
            role: 'SYSTEM_DESIGN_INTERVIEWER',
            guidance: `You are conducting a SYSTEM DESIGN interview. Your goals:
1. Guide the candidate through designing a distributed system
2. Output Mermaid diagrams in code blocks to visualize architecture as you discuss
3. Probe trade-offs: "Why X over Y?" "What if this fails?"
4. Cover: requirements, high-level design, deep dive, scaling
5. Let the candidate drive the design, guide with questions
6. NO coding - this is a design interview`
        }, null, 2);
    }),

    end_interview: wrapTool('end_interview', async () => {
        console.log("🏁 Agent triggered end_interview");
        const store = useSystemDesignStore.getState();
        const { onEndInterview } = store;

        if (!onEndInterview) {
            return "End interview handler not available.";
        }

        setTimeout(() => {
            onEndInterview();
        }, 1500);

        return "Interview ending. The report will be generated now. Say your final goodbye to the candidate.";
    }),

    read_transcript: wrapTool('read_transcript', async (args?: { last_n_messages?: number }) => {
        console.log("📜 read_transcript called");
        const store = useSystemDesignStore.getState();
        const { transcript } = store;

        if (transcript.length === 0) {
            return "The conversation transcript is empty. No messages have been exchanged yet.";
        }

        const limit = args?.last_n_messages || 20;
        const recentMessages = transcript.slice(-limit);

        const formattedTranscript = recentMessages.map((msg) => {
            const timestamp = new Date(msg.timestamp).toLocaleTimeString();
            const speaker = msg.speaker === 'agent' ? 'You (Alexis)' : 'Candidate';
            const type = msg.type === 'text' ? '[text]' : '[audio]';
            return `[${timestamp}] ${speaker} ${type}: ${msg.message}`;
        }).join('\n\n');

        return JSON.stringify({
            total_messages: transcript.length,
            showing_last: recentMessages.length,
            transcript: formattedTranscript,
            note: transcript.length > limit ? `Showing last ${limit} messages of ${transcript.length} total. Call with last_n_messages parameter to see more.` : 'Showing all messages.'
        }, null, 2);
    }),

    // Deprecated diagram tools - agent should use Mermaid syntax instead
    update_diagram: wrapTool('update_diagram', async () => {
        return "⚠️ update_diagram tool has been removed. Output Mermaid diagrams in code blocks instead:\n```mermaid\ngraph LR\n    Client[Web Client] --> API[API Server]\n    API --> DB[(Database)]\n```";
    }),

    read_diagram: wrapTool('read_diagram', async () => {
        return "⚠️ read_diagram tool has been removed. Check the conversation transcript (read_transcript) to see previously generated diagrams.";
    }),
});
