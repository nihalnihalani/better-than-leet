/**
 * Behavioral Interview Tool Handlers
 * Minimal set: interview control + transcript reading
 */

import { useBehavioralStore } from './behavioral-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapTool = (name: string, fn: (...a: any[]) => any) => async (...args: any[]) => {
    try {
        const result = await fn(...args);
        return result;
    } catch (error) {
        return `Error in ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};

const STUB = "This tool is not available in behavioral interview mode.";

export const getBehavioralTools = () => ({
    read_candidate_code: wrapTool('read_candidate_code', async () => STUB),
    run_code: wrapTool('run_code', async () => STUB),
    get_current_problem: wrapTool('get_current_problem', async () => STUB),
    read_sandbox_file: wrapTool('read_sandbox_file', async () => STUB),
    install_dependency: wrapTool('install_dependency', async () => STUB),
    run_hidden_test: wrapTool('run_hidden_test', async () => STUB),
    provide_hint: wrapTool('provide_hint', async () => STUB),
    explain_concept: wrapTool('explain_concept', async () => STUB),
    get_integrity_status: wrapTool('get_integrity_status', async () => STUB),

    get_interview_mode: wrapTool('get_interview_mode', async () => {
        return JSON.stringify({
            mode: 'behavioral',
            role: 'BEHAVIORAL_INTERVIEWER',
            guidance: `You are conducting a behavioral interview using the STAR method. Your goals:
1. Ask behavioral questions one at a time about the selected topic
2. Listen to the candidate's stories and probe for STAR components
3. Follow up on missing Situation, Task, Action, or Result details
4. Evaluate the quality and specificity of their examples
5. NO coding - this is a behavioral interview, not technical`
        }, null, 2);
    }),

    end_interview: wrapTool('end_interview', async () => {
        const store = useBehavioralStore.getState();
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
        const store = useBehavioralStore.getState();
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
            note: transcript.length > limit ? `Showing last ${limit} of ${transcript.length} total.` : 'Showing all messages.'
        }, null, 2);
    }),
});
