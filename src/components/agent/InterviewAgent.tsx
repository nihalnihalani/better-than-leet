'use client';

import { useInterviewStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { StatusIndicator } from './StatusIndicator';
import { Visualizer } from './Visualizer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { Mic, MicOff, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getAgentTools } from '@/lib/agent-tools';
import { GeminiLiveClient, ConnectionStatus, InterviewMode, ProblemContext } from '@/lib/minimax-live-client';
import { PROBLEMS } from '@/data/problems';
import { COMPANIES } from '@/data/company-problems';

export function InterviewAgent() {
    const { code, workspaceId, workspaceStatus, interviewMode, currentProblemId, selectedCompanyId, setAgentDisconnect } = useInterviewStore();
    const [isThinking, setIsThinking] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    
    // MiniMax Live Client State
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
            const id = call.id; // MiniMax function call ID
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
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Kept for compatibility if client needs it, though MiniMax client might not.
        console.log("🔑 API Key available:", !!apiKey);

        // Create client with current interview mode (real or practice)
        const mode: InterviewMode = interviewMode === 'practice' ? 'practice' : 'real';
        console.log(`🎙️ Creating MiniMax Live client in ${mode} mode`);
        const client = new GeminiLiveClient(apiKey, mode);

        client.onStatusChange = (s) => setStatus(s);
        client.onToolsCall = handleToolsCall;
        client.onVolume = (vol) => {
            setVolume(vol);
            setIsSpeaking(vol > 0.01);
        };
        client.onError = (err) => {
            console.error("MiniMax Client Error:", err);
            setIsThinking(false);
            setCurrentAction('');
        };
        client.onMessage = (msg) => {
             // Handle text transcript updates from model
             useInterviewStore.getState().addTranscriptMessage('agent', msg, 'audio');
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
                setCurrentAction('Shifu speaking...');
            }
        };

        // Handle case where model doesn't respond (useful for debugging)
        client.onNoResponse = () => {
            console.warn("⚠️ Model didn't respond to user input");
        };

        clientRef.current = client;
        console.log(`🎙️ MiniMax Live client initialized in ${mode} mode`);

        // Register disconnect callback for ending interview
        setAgentDisconnect(() => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        });

        return () => {
            client.disconnect();
            setAgentDisconnect(null);
        };
    }, [workspaceId, interviewMode, setAgentDisconnect]); // Re-init if workspace or interview mode changes

    // Auto-start when workspace is ready
    useEffect(() => {
        if (workspaceStatus === 'ready' && status === 'disconnected' && clientRef.current) {
            console.log("🚀 Auto-starting MiniMax Live (workspace ready)");
            handleStart();
        }
    }, [workspaceStatus, status]);

    // Track previous code to detect meaningful changes
    const previousCodeRef = useRef<string>('');
    const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCodeUpdateRef = useRef<number>(0);

    // Send code updates to MiniMax when candidate types (with debouncing)
    useEffect(() => {
        // Only send if connected and code has meaningfully changed
        if (!clientRef.current?.isConnected() || status !== 'connected') {
            return;
        }

        const currentCode = code || '';
        const previousCode = previousCodeRef.current;

        // Calculate if change is significant (more than just a character or two)
        const codeLengthDiff = Math.abs(currentCode.length - previousCode.length);
        const isSignificantChange = codeLengthDiff > 20 ||
            (currentCode.length > 0 && previousCode.length === 0) ||
            currentCode.includes('\n') !== previousCode.includes('\n');

        // Don't send too frequently (minimum 5 seconds between updates)
        const now = Date.now();
        const timeSinceLastUpdate = now - lastCodeUpdateRef.current;

        if (isSignificantChange && timeSinceLastUpdate > 5000) {
            // Clear any pending timeout
            if (codeUpdateTimeoutRef.current) {
                clearTimeout(codeUpdateTimeoutRef.current);
            }

            // Debounce: wait 2 seconds after typing stops before sending
            codeUpdateTimeoutRef.current = setTimeout(() => {
                if (clientRef.current?.isConnected() && currentCode.trim()) {
                    console.log("📝 Sending code update to MiniMax (debounced)");
                    clientRef.current.sendCodeContext(currentCode, true);
                    lastCodeUpdateRef.current = Date.now();
                    previousCodeRef.current = currentCode;
                }
            }, 2000);
        }

        return () => {
            if (codeUpdateTimeoutRef.current) {
                clearTimeout(codeUpdateTimeoutRef.current);
            }
        };
    }, [code, status]);

    // Helper to get current problem context for MiniMax
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
            console.error("❌ MiniMax client not initialized!");
            return;
        }

        try {
            // Set problem context BEFORE connecting so MiniMax knows the problem
            const problemContext = getCurrentProblemContext();
            if (problemContext) {
                clientRef.current.setProblemContext(problemContext);
                console.log(`📋 Starting interview with problem: ${problemContext.title}`);
            } else {
                console.warn("⚠️ No problem selected - MiniMax won't know what to interview about");
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
                <StatusIndicator status={status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting' : 'disconnected'} />

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
