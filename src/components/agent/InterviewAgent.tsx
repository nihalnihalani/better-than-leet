'use client';

import { useInterviewStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { StatusIndicator } from './StatusIndicator';
import { Visualizer } from './Visualizer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { Mic, MicOff, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getAgentTools } from '@/lib/agent-tools';
import { GeminiLiveClient, ConnectionStatus, InterviewMode, ProblemContext } from '@/lib/gemini-live-client';
import { PROBLEMS } from '@/data/problems';
import { COMPANIES } from '@/data/company-problems';
import { authFetch } from '@/lib/api-client';

export function InterviewAgent() {
    const { code, workspaceId, workspaceStatus, interviewMode, currentProblemId, selectedCompanyId, setAgentDisconnect } = useInterviewStore();
    const [isThinking, setIsThinking] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    
    // Gemini Live Client State
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [wasInterrupted, setWasInterrupted] = useState(false);
    const clientRef = useRef<GeminiLiveClient | null>(null);

    // Tool handler - always gets fresh state to avoid closure issues
    const handleToolsCall = useCallback(async (functionCalls: any[]) => {
        console.log("🛠️ Handling Tool Calls:", functionCalls.map((c: any) => c.name));

        // Get fresh tools with current workspaceId from store
        const currentWorkspaceId = useInterviewStore.getState().workspaceId;
        const toolFunctions = getAgentTools(currentWorkspaceId);

        const responses = [];

        for (const call of functionCalls) {
            const name = call.name;
            const args = call.args || {};
            const id = call.id; // Gemini function call ID
            const fn = (toolFunctions as any)[name];

            console.log(`🔧 Executing tool: ${name}`, { id, args });

            if (fn) {
                setIsThinking(true);
                setCurrentAction(`Running ${name}...`);
                try {
                    const result = await fn(args);
                    console.log(`✅ Tool ${name} result:`, typeof result === 'string' ? result.substring(0, 200) : result);
                    responses.push({
                        id: id, // Include the function call ID
                        name: name,
                        response: { result: result }
                    });
                } catch (err) {
                    console.error(`❌ Tool ${name} error:`, err);
                    responses.push({
                        id: id,
                        name: name,
                        response: { error: String(err) }
                    });
                }
                setIsThinking(false);
            } else {
                console.warn(`⚠️ Tool ${name} not found in toolFunctions`);
                responses.push({
                    id: id,
                    name: name,
                    response: { error: `Tool ${name} not found` }
                });
            }
        }
        return responses;
    }, []); // Empty deps - always get fresh state from store

    // Initialize Client
    useEffect(() => {
        let cancelled = false;

        async function initClient() {
            // Try server-side proxy first, fall back to NEXT_PUBLIC_ env var
            let apiKey: string | undefined;
            try {
                const res = await authFetch('/api/gemini/session');
                const data = await res.json();
                if (data.data?.apiKey) {
                    apiKey = data.data.apiKey;
                }
            } catch {
                // Server proxy unavailable, fall back
            }

            if (!apiKey) {
                apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            }

            console.log("🔑 Gemini API Key available:", !!apiKey, apiKey ? `(${apiKey.substring(0, 10)}...)` : '');

            if (!apiKey || cancelled) {
                if (!apiKey) {
                    console.error("❌ Gemini API Key missing! Set GEMINI_API_KEY in .env.local");
                }
                return;
            }

            // Create client with current interview mode (real or practice)
            const mode: InterviewMode = interviewMode === 'practice' ? 'practice' : 'real';
            console.log(`🎙️ Creating Gemini Live client in ${mode} mode`);
            const client = new GeminiLiveClient(apiKey.trim(), mode);

        client.onStatusChange = (s) => setStatus(s);
        client.onToolsCall = handleToolsCall;
        client.onVolume = (vol) => {
            setVolume(vol);
            setIsSpeaking(vol > 0.01);
        };
        client.onError = (err) => {
            console.error("Gemini Client Error:", err);
            setIsThinking(false);
            setCurrentAction('');
        };
        client.onMessage = (msg) => {
             // Handle text transcript updates from model
             useInterviewStore.getState().addTranscriptMessage('agent', msg, 'audio');
        };
        client.onUserTranscript = (text) => {
            // Handle user speech transcription from Gemini
            useInterviewStore.getState().addTranscriptMessage('user', text, 'audio');
        };
        // New callbacks for natural conversation flow
        client.onInterrupted = () => {
            console.log("🛑 User interrupted - stopping AI speech");
            setWasInterrupted(true);
            setIsModelSpeaking(false);
            setIsThinking(false);
            setCurrentAction('');
            // Show feedback for 3 seconds so user knows they were heard
            setTimeout(() => setWasInterrupted(false), 3000);
        };
        client.onTurnEnd = () => {
            console.log("✅ Model turn complete");
            setIsModelSpeaking(false);
            setIsThinking(false);
        };
        client.onModelSpeaking = (speaking) => {
            setIsModelSpeaking(speaking);
            if (speaking) {
                setCurrentAction('Alexis speaking...');
            }
        };

        // Handle case where model doesn't respond (useful for debugging)
        client.onNoResponse = () => {
            console.warn("⚠️ Model didn't respond to user input");
        };

        // Send initial code context when Gemini session is ready
        client.onSetupComplete = () => {
            const currentCode = useInterviewStore.getState().code;
            if (currentCode && currentCode.trim()) {
                console.log("📝 Sending initial code context to Gemini");
                client.sendCodeContext(currentCode, true);
            }
        };

        clientRef.current = client;
        console.log(`🎙️ Gemini Live client initialized in ${mode} mode`);

        // Register disconnect callback for ending interview
        setAgentDisconnect(() => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        });
        }

        initClient();

        return () => {
            cancelled = true;
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
            setAgentDisconnect(null);
        };
    }, [workspaceId, interviewMode, setAgentDisconnect]); // Re-init if workspace or interview mode changes

    // Auto-start when workspace is ready
    useEffect(() => {
        if (workspaceStatus === 'ready' && status === 'disconnected' && clientRef.current) {
            console.log("🚀 Auto-starting Gemini Live (workspace ready)");
            handleStart();
        }
    }, [workspaceStatus, status]);

    // Track previous code to detect meaningful changes
    const previousCodeRef = useRef<string>('');
    const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCodeUpdateRef = useRef<number>(0);

    // Send code updates to Gemini when candidate pauses typing (with longer debounce)
    useEffect(() => {
        // Only send if connected and code has meaningfully changed
        if (!clientRef.current?.isConnected() || status !== 'connected') {
            return;
        }

        const currentCode = code || '';
        const previousCode = previousCodeRef.current;

        // Skip if code hasn't changed
        if (currentCode === previousCode) return;

        // Don't send too frequently (minimum 10 seconds between updates)
        const now = Date.now();
        const timeSinceLastUpdate = now - lastCodeUpdateRef.current;

        // Clear any pending timeout - user is still typing
        if (codeUpdateTimeoutRef.current) {
            clearTimeout(codeUpdateTimeoutRef.current);
        }

        // Wait 5 seconds after typing stops before sending code context
        // This ensures we don't interrupt the user while they're actively coding
        const debounceMs = timeSinceLastUpdate > 10000 ? 5000 : 8000;

        codeUpdateTimeoutRef.current = setTimeout(() => {
            if (clientRef.current?.isConnected() && currentCode.trim()) {
                console.log("📝 Sending code update to Gemini (user paused typing)");
                clientRef.current.sendCodeContext(currentCode, true);
                lastCodeUpdateRef.current = Date.now();
                previousCodeRef.current = currentCode;
            }
        }, debounceMs);

        return () => {
            if (codeUpdateTimeoutRef.current) {
                clearTimeout(codeUpdateTimeoutRef.current);
            }
        };
    }, [code, status]);

    // Helper to get current problem context for Gemini
    const getCurrentProblemContext = (): ProblemContext | null => {
        if (!currentProblemId) return null;

        // Try regular problems first
        const regularProblem = PROBLEMS.find(p => p.id === currentProblemId);
        if (regularProblem) {
            return {
                title: regularProblem.title,
                difficulty: regularProblem.difficulty,
                description: regularProblem.description,
                examples: regularProblem.examples,
                constraints: regularProblem.constraints,
                functionName: regularProblem.functionName,
                starterCode: regularProblem.starterCode,
            };
        }

        // Try company problems (practice mode)
        if (interviewMode === 'practice' && selectedCompanyId) {
            const company = COMPANIES.find(c => c.id === selectedCompanyId);
            const companyProblem = company?.problems.find(p => p.id === currentProblemId);
            if (companyProblem) {
                return {
                    title: companyProblem.title,
                    difficulty: companyProblem.difficulty,
                    description: companyProblem.description,
                    examples: companyProblem.examples,
                    constraints: companyProblem.constraints,
                    functionName: companyProblem.functionName,
                    starterCode: companyProblem.starterCode,
                    companyName: company?.name,
                    tags: companyProblem.tags,
                };
            }
        }

        return null;
    };

    const handleStart = async () => {
        console.log("🚀 handleStart called, clientRef.current:", !!clientRef.current);

        if (!clientRef.current) {
            console.error("❌ Gemini client not initialized!");
            return;
        }

        try {
            // Set problem context BEFORE connecting so Gemini knows the problem
            const problemContext = getCurrentProblemContext();
            if (problemContext) {
                clientRef.current.setProblemContext(problemContext);
                console.log(`📋 Starting interview with problem: ${problemContext.title}`);
            } else {
                console.warn("⚠️ No problem selected - Gemini won't know what to interview about");
            }

            console.log("🔌 Calling connect()...");
            await clientRef.current.connect();
            console.log("✅ Connect called successfully");
        } catch (err) {
            console.error("❌ Error in handleStart:", err);
        }
    };

    const handleStop = () => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    };

    return (
        <div id="agent-container" className="flex flex-col gap-4">
            {/* Thinking Indicator */}
            {(isThinking || isModelSpeaking) && (
                <ThinkingIndicator isThinking={isThinking || isModelSpeaking} currentAction={currentAction} />
            )}

            {/* Interruption feedback */}
            {wasInterrupted && (
                <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/30 flex items-center gap-2 animate-pulse">
                    <MicOff className="w-3 h-3" />
                    Listening to you...
                </div>
            )}

            <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                <div className="flex flex-col items-center gap-2">
                    <StatusIndicator status={status} isModelSpeaking={isModelSpeaking} />
                    {status === 'connected' && !isModelSpeaking && isSpeaking && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <Mic className="w-2.5 h-2.5 animate-pulse" />
                            <span>Mic active</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full min-w-0">
                    <Visualizer isSpeaking={isSpeaking || isModelSpeaking} volume={volume} />
                </div>

                {status === 'connected' ? (
                    <Button variant="destructive" size="icon" onClick={handleStop}>
                        <MicOff className="w-4 h-4" />
                    </Button>
                ) : status === 'connecting' ? (
                    <Button variant="outline" disabled>
                        <Mic className="w-4 h-4 mr-2 animate-pulse" />
                        Connecting...
                    </Button>
                ) : workspaceStatus !== 'ready' ? (
                    <Button variant="outline" disabled>
                        {interviewMode === 'practice' ? (
                            <GraduationCap className="w-4 h-4 mr-2" />
                        ) : (
                            <Mic className="w-4 h-4 mr-2" />
                        )}
                        Waiting for workspace...
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        onClick={handleStart}
                    >
                        {interviewMode === 'practice' ? (
                            <GraduationCap className="w-4 h-4 mr-2" />
                        ) : (
                            <Mic className="w-4 h-4 mr-2" />
                        )}
                        Reconnect
                    </Button>
                )}
            </div>
        </div>
    );
}
