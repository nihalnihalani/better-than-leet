'use client';

import { useInterviewStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { VoiceOrb } from './VoiceOrb';
import { Mic, MicOff, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getAgentTools } from '@/lib/agent-tools';
import { InterviewLiveClient, ConnectionStatus, InterviewMode, ProblemContext } from '@/lib/interview-live-client';
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
    const clientRef = useRef<InterviewLiveClient | null>(null);

    // Tool handler - always gets fresh state to avoid closure issues
    const handleToolsCall = useCallback(async (functionCalls: any[]) => {
        // Get fresh tools - they read workspaceId from the store internally
        const toolFunctions = getAgentTools();

        const responses = [];

        for (const call of functionCalls) {
            const name = call.name;
            const args = call.args || {};
            const id = call.id; // Gemini function call ID
            const fn = (toolFunctions as any)[name];

            if (fn) {
                setIsThinking(true);
                setCurrentAction(`Running ${name}...`);
                try {
                    const result = await fn(args);
                    responses.push({
                        id: id, // Include the function call ID
                        name: name,
                        response: { result: result }
                    });
                } catch (err) {
                    console.error(`Tool ${name} error:`, err);
                    responses.push({
                        id: id,
                        name: name,
                        response: { error: String(err) }
                    });
                }
                setIsThinking(false);
            } else {
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

            if (!apiKey || cancelled) {
                if (!apiKey) {
                    console.error("Gemini API Key missing! Set GEMINI_API_KEY in .env.local");
                }
                return;
            }

            // Create client with current interview mode (real or practice)
            const mode: InterviewMode = interviewMode === 'practice' ? 'practice' : 'real';
            const client = new InterviewLiveClient(apiKey.trim(), mode);

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
            setWasInterrupted(true);
            setIsModelSpeaking(false);
            setIsThinking(false);
            setCurrentAction('');
            // Show feedback for 3 seconds so user knows they were heard
            setTimeout(() => setWasInterrupted(false), 3000);
        };
        client.onTurnEnd = () => {
            setIsModelSpeaking(false);
            setIsThinking(false);
        };
        client.onModelSpeaking = (speaking) => {
            setIsModelSpeaking(speaking);
            if (speaking) {
                setCurrentAction('Alexis speaking...');
            }
        };

        // Send initial code context when Gemini session is ready
        client.onSetupComplete = () => {
            const currentCode = useInterviewStore.getState().code;
            if (currentCode && currentCode.trim()) {
                client.sendCodeContext(currentCode, true);
            }
        };

        clientRef.current = client;

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
            if (codeUpdateTimeoutRef.current) {
                clearTimeout(codeUpdateTimeoutRef.current);
            }
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
            setAgentDisconnect(null);
        };
    }, [workspaceId, interviewMode, setAgentDisconnect]); // Re-init if workspace or interview mode changes

    // Track previous code to detect meaningful changes
    const previousCodeRef = useRef<string>('');
    const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCodeUpdateRef = useRef<number>(0);

    // Helper to get current problem context for Gemini
    const getCurrentProblemContext = useCallback((): ProblemContext | null => {
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
    }, [currentProblemId, interviewMode, selectedCompanyId]);

    const handleStart = useCallback(async () => {
        if (!clientRef.current) {
            return;
        }

        try {
            // Set problem context BEFORE connecting so Gemini knows the problem
            const problemContext = getCurrentProblemContext();
            if (problemContext) {
                clientRef.current.setProblemContext(problemContext);
            }

            await clientRef.current.connect();
        } catch (err) {
            console.error("Error in handleStart:", err);
        }
    }, [getCurrentProblemContext]);

    const handleStop = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    }, []);

    // Auto-start when workspace is ready
    useEffect(() => {
        if (workspaceStatus === 'ready' && status === 'disconnected' && clientRef.current) {
            handleStart();
        }
    }, [workspaceStatus, status, handleStart]);

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

    return (
        <div id="agent-container" className="flex flex-col items-center gap-2">
            {/* Voice Orb — central focal point */}
            <VoiceOrb
                status={status}
                isSpeaking={isSpeaking}
                isModelSpeaking={isModelSpeaking}
                volume={volume}
                isThinking={isThinking}
                currentAction={currentAction}
            />

            {/* Interruption feedback */}
            {wasInterrupted && (
                <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 flex items-center gap-1.5 animate-pulse">
                    <MicOff className="w-3 h-3" />
                    Listening to you...
                </div>
            )}

            {/* Control button */}
            <div className="pt-1">
                {status === 'connected' ? (
                    <Button variant="destructive" size="sm" onClick={handleStop} className="rounded-full px-4">
                        <MicOff className="w-3.5 h-3.5 mr-1.5" />
                        End
                    </Button>
                ) : status === 'connecting' ? (
                    <Button variant="outline" size="sm" disabled className="rounded-full px-4">
                        <Mic className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                        Connecting...
                    </Button>
                ) : workspaceStatus !== 'ready' ? (
                    <Button variant="outline" size="sm" disabled className="rounded-full px-4">
                        {interviewMode === 'practice' ? (
                            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                        ) : (
                            <Mic className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Setting up...
                    </Button>
                ) : (
                    <Button variant="default" size="sm" onClick={handleStart} className="rounded-full px-4">
                        {interviewMode === 'practice' ? (
                            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                        ) : (
                            <Mic className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Reconnect
                    </Button>
                )}
            </div>
        </div>
    );
}
