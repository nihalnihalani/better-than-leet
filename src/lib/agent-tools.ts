import { useInterviewStore, CustomProblem } from '@/lib/store';
import { generateTestCode } from '@/lib/test-runner';
import { Problem } from '@/data/problems';
import { COMPANIES, CompanyProblem, getAllCompanyProblems, NEETCODE_CATEGORIES } from '@/data/company-problems';
import { authFetch } from '@/lib/api-client';

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

// Helper to get the current problem (works for both regular and practice mode)
function getCurrentProblem(): Problem | CompanyProblem | CustomProblem | null {
    const store = useInterviewStore.getState();
    const { currentProblemId, interviewMode, selectedCompanyId, customProblems } = store;

    if (!currentProblemId) return null;

    // Practice mode - check different sources based on selected company
    if (interviewMode === 'practice' && selectedCompanyId) {
        // Custom problems
        if (selectedCompanyId === 'custom') {
            const customProblem = customProblems.find(p => p.id === currentProblemId);
            if (customProblem) return customProblem;
        }
        // NeetCode 150 problems
        else if (selectedCompanyId === 'neetcode-150') {
            const neetcodeProblem = NEETCODE_CATEGORIES
                .flatMap(cat => cat.problems)
                .find(p => p.id === currentProblemId);
            if (neetcodeProblem) return neetcodeProblem;
        }
        // Regular company problems
        else {
            const company = COMPANIES.find(c => c.id === selectedCompanyId);
            const companyProblem = company?.problems.find(p => p.id === currentProblemId);
            if (companyProblem) return companyProblem;
        }
    }

    // Regular interview mode - check all company problems including NeetCode
    const allProblems = getAllCompanyProblems();
    const problem = allProblems.find(p => p.id === currentProblemId);
    if (problem) return problem;

    // Also check custom problems
    const customProblem = customProblems.find(p => p.id === currentProblemId);
    if (customProblem) return customProblem;

    return null;
}

// Type guard for company problems
function isCompanyProblem(problem: Problem | CompanyProblem): problem is CompanyProblem {
    return 'company' in problem && 'hints' in problem;
}


export const getAgentTools = () => ({
    read_candidate_code: wrapTool('read_candidate_code', async () => {
        const store = useInterviewStore.getState();
        const currentCode = store.code;

        console.log("📝 read_candidate_code called");
        console.log("📝 Code length:", currentCode?.length || 0);
        console.log("📝 Code preview:", currentCode ? currentCode.substring(0, 100) + "..." : "(empty)");

        if (!currentCode || currentCode.trim() === '') {
            return "The code editor is empty. The candidate hasn't written any code yet.";
        }

        // Truncate if too long to avoid token limits/connection drops
        if (currentCode.length > 20000) {
            return currentCode.substring(0, 20000) + "\n...[Code truncated due to length]...";
        }
        return currentCode;
    }),

    read_sandbox_file: wrapTool('read_sandbox_file', async ({ path }: { path: string }) => {
        console.log("Agent requested file read:", path);
        const workspaceId = useInterviewStore.getState().workspaceId;
        if (!workspaceId) return "No active workspace.";

        const response = await authFetch('/api/sandbox/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId, path })
        });
        const json = await response.json();
        const data = json.data || json;
        return data.content || "File not found or empty.";
    }),

    run_coderabbit_analysis: wrapTool('run_coderabbit_analysis', async () => {
        console.log("Agent requested CodeRabbit analysis");
        const workspaceId = useInterviewStore.getState().workspaceId;
        if (!workspaceId) return "No active workspace.";

        const response = await authFetch('/api/analysis/coderabbit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId })
        });
        const data = await response.json();
        return JSON.stringify(data);
    }),

    run_code: wrapTool('run_code', async () => {
        const store = useInterviewStore.getState();
        const workspaceId = store.workspaceId;

        console.log("🚀 run_code called");
        console.log("🚀 Workspace ID:", workspaceId || "(none)");
        console.log("🚀 Code length:", store.code?.length || 0);
        console.log("🚀 Language:", store.language);

        if (!workspaceId) {
            return "No active sandbox workspace. Please wait for the sandbox to initialize.";
        }

        const code = store.code;
        const language = store.language;
        const currentProblemId = store.currentProblemId;

        // Find current problem from either source
        const currentProblem = getCurrentProblem();
        const testCode = currentProblem
            ? generateTestCode(currentProblem, code, language)
            : code;

        const response = await authFetch('/api/sandbox/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId, code: testCode, language })
        });
        const json = await response.json();
        const result = json.data || json;

        // Display output in the UI console (same as manual run)
        if (result.stdout) {
            store.addLog(result.stdout, 'stdout');

            // Parse and store test results if tests were run
            if (currentProblem) {
                const testOutput = result.stdout;
                const passedMatches = testOutput.match(/✓ Test \d+ passed/g) || [];
                const testsTotal = currentProblem.testCases.length;
                const testsPassed = passedMatches.length;

                store.addTestResult({
                    timestamp: Date.now(),
                    problemId: currentProblemId || 'unknown',
                    testsPassed,
                    testsTotal,
                    details: {
                        stdout: result.stdout,
                        stderr: result.stderr,
                    },
                });
            }
        }

        if (result.stderr) {
            store.addLog(result.stderr, 'stderr');
        }

        // Return formatted test results to the agent (truncated to avoid connection drops)
        const stdout = result.stdout ?? '';
        const stderr = result.stderr ?? '';
        const stdoutTrunc = stdout.length > 5000 ? stdout.substring(0, 5000) + "...[truncated]" : stdout;
        const stderrTrunc = stderr.length > 5000 ? stderr.substring(0, 5000) + "...[truncated]" : stderr;

        return `Exit Code: ${result.isError ? 1 : 0}\nStdout: ${stdoutTrunc}\nStderr: ${stderrTrunc}`;
    }),

    install_dependency: wrapTool('install_dependency', async ({ packageName, manager }: { packageName: string, manager: string }) => {
        console.log(`Agent requested install: ${packageName} via ${manager}`);
        const workspaceId = useInterviewStore.getState().workspaceId;
        if (!workspaceId) return "No active workspace.";

        const response = await authFetch('/api/sandbox/install', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId, packageName, manager })
        });
        const json = await response.json();
        const result = json.data || json;
        if (result.isError) {
            return `Failed to install ${packageName}: ${result.stderr}`;
        }
        return `Successfully installed ${packageName}. stdout: ${result.stdout}`;
    }),

    run_hidden_test: wrapTool('run_hidden_test', async ({ testCode }: { testCode: string }) => {
        console.log("Agent requested hidden test execution");
        const workspaceId = useInterviewStore.getState().workspaceId;
        if (!workspaceId) return "No active workspace.";

        const response = await authFetch('/api/sandbox/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId, testCode })
        });
        const json = await response.json();
        const result = json.data || json;
        return `Test Execution Result:\nExit Code: ${result.isError ? 1 : 0}\nStdout: ${result.stdout}\nStderr: ${result.stderr}`;
    }),

    get_current_problem: wrapTool('get_current_problem', async () => {
        console.log("Agent requested current problem info");
        const store = useInterviewStore.getState();
        const { interviewMode, selectedCompanyId } = store;
        const problem = getCurrentProblem();

        if (!problem) {
            return "No problem selected yet. Please wait for the candidate to select a problem.";
        }

        // Base problem info
        const problemInfo: Record<string, unknown> = {
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.description,
            examples: problem.examples,
            constraints: problem.constraints,
            functionName: problem.functionName,
            hint: `The candidate needs to implement a function called '${problem.functionName}'.`
        };

        // Add practice interview specific info
        if (interviewMode === 'practice' && isCompanyProblem(problem)) {
            const company = COMPANIES.find(c => c.id === selectedCompanyId);
            problemInfo.interviewMode = 'practice';
            problemInfo.companyName = company?.name || 'Unknown';
            problemInfo.tags = problem.tags;
            problemInfo.frequency = problem.frequency;
            problemInfo.hintsAvailable = problem.hints.length;
            problemInfo.coachingNote = `This is a PRACTICE session. Your role is to be a supportive COACH, not an evaluator. Help the student learn and grow. Provide encouragement and constructive guidance.`;
        }

        return JSON.stringify(problemInfo, null, 2);
    }),

    get_interview_mode: wrapTool('get_interview_mode', async () => {
        console.log("Agent requested interview mode info");
        const store = useInterviewStore.getState();
        const { interviewMode, selectedCompanyId } = store;

        if (interviewMode === 'system-design') {
            return JSON.stringify({
                mode: 'system-design',
                role: 'SYSTEM_DESIGN_INTERVIEWER',
                guidance: `You are conducting a SYSTEM DESIGN interview. Your goals:
1. Guide the candidate through designing a distributed system
2. Use update_diagram to build the architecture diagram as discussion progresses
3. Probe trade-offs: "Why X over Y?" "What if this fails?"
4. Cover: requirements, high-level design, deep dive, scaling
5. Let the candidate drive the design, guide with questions
6. NO coding - this is a design interview`
            }, null, 2);
        }

        if (interviewMode === 'practice') {
            const company = COMPANIES.find(c => c.id === selectedCompanyId);
            return JSON.stringify({
                mode: 'practice',
                companyName: company?.name || 'Unknown',
                role: 'COACH',
                guidance: `You are conducting a PRACTICE interview in coaching mode. Your goals:
1. Be SUPPORTIVE and ENCOURAGING - this is for learning
2. Provide HINTS when the student is stuck (ask if they want a hint first)
3. Explain CONCEPTS when they don't understand
4. Focus on TEACHING, not evaluating
5. NEVER give hire/no-hire recommendations
6. Celebrate small wins and progress
7. Frame mistakes as learning opportunities`
            }, null, 2);
        }

        return JSON.stringify({
            mode: 'real',
            role: 'INTERVIEWER',
            guidance: 'Standard interview mode. Evaluate the candidate professionally.'
        }, null, 2);
    }),

    provide_hint: wrapTool('provide_hint', async ({ level }: { level?: number }) => {
        console.log("Agent requested hint, level:", level);
        const store = useInterviewStore.getState();
        const { interviewMode } = store;

        if (interviewMode !== 'practice') {
            return "Hints are only available in practice mode.";
        }

        const problem = getCurrentProblem();
        if (!problem || !isCompanyProblem(problem)) {
            return "No problem with hints available.";
        }

        const hintLevel = typeof level === 'number' ? Math.max(0, Math.min(level, problem.hints.length - 1)) : 0;
        const hint = problem.hints[hintLevel];

        if (!hint) {
            return "No more hints available for this problem.";
        }

        return JSON.stringify({
            hintNumber: hintLevel + 1,
            totalHints: problem.hints.length,
            hint: hint,
            moreHintsAvailable: hintLevel < problem.hints.length - 1
        }, null, 2);
    }),

    explain_concept: wrapTool('explain_concept', async ({ topic }: { topic: string }) => {
        console.log("Agent requested concept explanation:", topic);
        const store = useInterviewStore.getState();
        const { interviewMode } = store;

        if (interviewMode !== 'practice') {
            return "Concept explanations are for practice mode coaching.";
        }

        // Return confirmation that the AI should explain this concept
        // The AI will use its own knowledge to explain
        return JSON.stringify({
            status: "ready_to_explain",
            topic: topic,
            action: "You should now explain this concept verbally to the candidate in a clear, friendly way. Use simple examples and check if they understand."
        }, null, 2);
    }),

    get_integrity_status: wrapTool('get_integrity_status', async () => {
        const store = useInterviewStore.getState();
        if (store.getIntegrityReport) {
            return store.getIntegrityReport();
        }
        return "Integrity monitoring not available.";
    }),

    end_interview: wrapTool('end_interview', async () => {
        console.log("🏁 Agent triggered end_interview");
        const store = useInterviewStore.getState();
        const { onEndInterview } = store;

        if (!onEndInterview) {
            return "End interview handler not available.";
        }

        // Delay slightly so the tool response is sent back to Gemini
        // before we tear down the connection
        setTimeout(() => {
            onEndInterview();
        }, 1500);

        return "Interview ending. The report will be generated now. Say your final goodbye to the candidate.";
    }),

    read_transcript: wrapTool('read_transcript', async (args?: { last_n_messages?: number }) => {
        console.log("📜 read_transcript called");
        const store = useInterviewStore.getState();
        const { transcript } = store;

        if (transcript.length === 0) {
            return "The conversation transcript is empty. No messages have been exchanged yet.";
        }

        const limit = args?.last_n_messages || 20;
        const recentMessages = transcript.slice(-limit);

        const formattedTranscript = recentMessages.map((msg, idx) => {
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

    // System Design diagram tool (single batched operation)
    update_diagram: wrapTool('update_diagram', async (args: {
        add_nodes?: Array<{ id: string; type: string; label: string; subtitle?: string }>;
        add_edges?: Array<{ from: string; to: string; label?: string }>;
        remove_nodes?: string[];
        update_nodes?: Array<{ id: string; label?: string; subtitle?: string }>;
    }) => {
        console.log("📊 update_diagram called with batched operations:", args);
        const store = useInterviewStore.getState();
        const results: string[] = [];
        const errors: string[] = [];

        // Process node additions
        if (args.add_nodes && args.add_nodes.length > 0) {
            for (const node of args.add_nodes) {
                if (!node.id || !node.type || !node.label) {
                    errors.push(`Skipped node: missing id, type, or label`);
                    continue;
                }
                if (store.diagramNodes.find(n => n.id === node.id)) {
                    errors.push(`Node '${node.id}' already exists (skipped)`);
                    continue;
                }
                store.addDiagramNode({
                    id: node.id,
                    type: node.type as any,
                    label: node.label,
                    subtitle: node.subtitle,
                });
                results.push(`Added node '${node.label}' (${node.type})`);
            }
        }

        // Process edge additions
        if (args.add_edges && args.add_edges.length > 0) {
            for (const edge of args.add_edges) {
                if (!edge.from || !edge.to) {
                    errors.push(`Skipped edge: missing 'from' or 'to'`);
                    continue;
                }
                const srcExists = store.diagramNodes.find(n => n.id === edge.from);
                const tgtExists = store.diagramNodes.find(n => n.id === edge.to);
                if (!srcExists) {
                    errors.push(`Source node '${edge.from}' not found (skipped edge)`);
                    continue;
                }
                if (!tgtExists) {
                    errors.push(`Target node '${edge.to}' not found (skipped edge)`);
                    continue;
                }
                const edgeId = `${edge.from}-to-${edge.to}`;
                if (store.diagramEdges.find(e => e.id === edgeId)) {
                    errors.push(`Edge ${edge.from}→${edge.to} already exists (skipped)`);
                    continue;
                }
                store.addDiagramEdge({
                    id: edgeId,
                    source: edge.from,
                    target: edge.to,
                    label: edge.label,
                });
                results.push(`Added edge ${edge.from}→${edge.to}${edge.label ? ` ('${edge.label}')` : ''}`);
            }
        }

        // Process node removals
        if (args.remove_nodes && args.remove_nodes.length > 0) {
            for (const nodeId of args.remove_nodes) {
                if (store.diagramNodes.find(n => n.id === nodeId)) {
                    store.removeDiagramNode(nodeId);
                    results.push(`Removed node '${nodeId}' and its edges`);
                } else {
                    errors.push(`Node '${nodeId}' not found (skipped removal)`);
                }
            }
        }

        // Process node updates
        if (args.update_nodes && args.update_nodes.length > 0) {
            for (const update of args.update_nodes) {
                if (!update.id) {
                    errors.push(`Skipped update: missing node id`);
                    continue;
                }
                const existing = store.diagramNodes.find(n => n.id === update.id);
                if (!existing) {
                    errors.push(`Node '${update.id}' not found (skipped update)`);
                    continue;
                }
                const updates: any = {};
                if (update.label) updates.label = update.label;
                if (update.subtitle) updates.subtitle = update.subtitle;
                store.updateDiagramNode(update.id, updates);
                results.push(`Updated node '${update.id}'`);
            }
        }

        // Build response
        const summary = {
            success: results.length > 0,
            operations_completed: results.length,
            operations_failed: errors.length,
            details: results,
            errors: errors.length > 0 ? errors : undefined,
        };

        return JSON.stringify(summary, null, 2);
    }),

    read_diagram: wrapTool('read_diagram', async () => {
        console.log("📊 read_diagram called");
        const store = useInterviewStore.getState();
        const { diagramNodes, diagramEdges } = store;

        if (diagramNodes.length === 0) {
            return "The diagram is currently empty. No nodes or edges have been added yet.";
        }

        return JSON.stringify({
            nodes: diagramNodes.map(n => ({
                id: n.id,
                type: n.type,
                label: n.label,
                subtitle: n.subtitle,
            })),
            edges: diagramEdges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                label: e.label,
            })),
        }, null, 2);
    }),
});
