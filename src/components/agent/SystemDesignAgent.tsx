'use client';

import { useSystemDesignStore } from '@/lib/system-design-store';
import { useInterviewStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { StatusIndicator } from './StatusIndicator';
import { Visualizer } from './Visualizer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { Mic, MicOff, Layers, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getSystemDesignTools } from '@/lib/system-design-agent-tools';
import { GeminiLiveClient, ConnectionStatus } from '@/lib/gemini-live-client';
import { authFetch, initSession } from '@/lib/api-client';
import { extractMermaidBlocks, validateMermaidSyntax } from '@/lib/mermaid-parser';

export function SystemDesignAgent() {
    const { setAgentDisconnect } = useSystemDesignStore();
    const hasHydrated = useSystemDesignStore((s) => s._hasHydrated);
    const [isThinking, setIsThinking] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');

    // Gemini Live Client State
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [wasInterrupted, setWasInterrupted] = useState(false);
    const [clientReady, setClientReady] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const clientRef = useRef<GeminiLiveClient | null>(null);
    const hasConnectedOnceRef = useRef(false);
    const shouldAutoReconnectRef = useRef(false);

    // Tool handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleToolsCall = useCallback(async (functionCalls: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (functionCalls.some((c: any) => c.name === 'end_interview') && clientRef.current) {
            clientRef.current.markInterviewEnding();
        }

        const toolFunctions = getSystemDesignTools();
        setIsThinking(true);
        setCurrentAction(`Running ${functionCalls.length} tool(s)...`);

        const responses = await Promise.all(
            functionCalls.map(async (call) => {
                const name = call.name;
                const args = call.args || {};
                const id = call.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fn = (toolFunctions as any)[name];

                if (fn) {
                    try {
                        const result = await fn(args);
                        return { id, name, response: { result } };
                    } catch (err) {
                        return { id, name, response: { error: String(err) } };
                    }
                } else {
                    return { id, name, response: { error: `Tool ${name} not found` } };
                }
            })
        );

        setIsThinking(false);
        return responses;
    }, []);

    // Initialize Client — creates GeminiLiveClient with API key
    const initClient = useCallback(async (): Promise<boolean> => {
        setInitError(null);

        // Ensure session token is available before fetching API key
        await initSession();

        let apiKey: string | undefined;
        try {
            const res = await authFetch('/api/gemini/session');
            const data = await res.json();
            if (data.data?.apiKey) {
                apiKey = data.data.apiKey;
            }
        } catch {
            setInitError('Failed to reach server. Check your connection.');
            return false;
        }

        if (!apiKey) {
            console.error("Gemini API Key missing. Set GEMINI_API_KEY in .env.local");
            setInitError('Gemini API key not configured. Set GEMINI_API_KEY in .env.local');
            return false;
        }

        const client = new GeminiLiveClient(apiKey.trim(), 'system-design');

        // Read topic from the now-hydrated store (guaranteed available)
        const topicId = useSystemDesignStore.getState().selectedTopicId;
        if (topicId) {
            client.setSystemDesignTopic(topicId);
        }

        // Set persona if selected
        const personaId = useInterviewStore.getState().selectedPersonaId;
        if (personaId) {
            const { getPersona } = await import('@/data/interviewer-personas');
            const persona = getPersona(personaId);
            if (persona) {
                client.setPersona(persona.promptAddition);
            }
        }

        client.onStatusChange = (s) => setStatus(s);
        client.onToolsCall = handleToolsCall;
        client.onVolume = (vol) => {
            setVolume(vol);
            setIsSpeaking(vol > 0.01);
        };
        client.onError = (err) => {
            console.error("System Design Client Error:", err);
            setInitError(err.message);
            setIsThinking(false);
            setCurrentAction('');
        };
        client.onMessage = (msg) => {
            const store = useSystemDesignStore.getState();
            store.addTranscriptMessage('agent', msg, 'audio');

            // Extract and validate Mermaid diagram blocks
            const mermaidBlocks = extractMermaidBlocks(msg);

            if (mermaidBlocks.length > 0) {
                const latestDiagram = mermaidBlocks[mermaidBlocks.length - 1];
                const validation = validateMermaidSyntax(latestDiagram);

                if (validation.valid) {
                    store.setMermaidDiagram(latestDiagram);
                    store.addTranscriptMessage('agent', '[System: Diagram successfully updated]', 'text');
                } else {
                    store.addTranscriptMessage('agent', `[System: Diagram update failed - ${validation.error}]`, 'text');
                }
            }
        };
        client.onUserTranscript = (text) => {
            useSystemDesignStore.getState().addTranscriptMessage('user', text, 'audio');
        };
        client.onInterrupted = () => {
            setWasInterrupted(true);
            setIsModelSpeaking(false);
            setIsThinking(false);
            setCurrentAction('');
            setTimeout(() => setWasInterrupted(false), 3000);
        };
        client.onTurnEnd = () => {
            setIsModelSpeaking(false);
            setIsThinking(false);
        };
        client.onModelSpeaking = (speaking) => {
            setIsModelSpeaking(speaking);
            if (speaking) setCurrentAction('Alexis speaking...');
        };
        client.onNoResponse = () => {};

        client.onSetupComplete = () => {
            setInitError(null);
            setTimeout(() => {
                if (client.isConnected()) {
                    if (hasConnectedOnceRef.current) {
                        // Reconnection — recover context without re-introducing
                        client.sendText(`[CONTEXT RECOVERY] The connection was briefly interrupted. Resume the interview from where we left off. Do NOT re-introduce the topic or re-greet the candidate.`);
                    } else {
                        // First connection — tell Gemini to follow its system instruction
                        client.sendText(`[SYSTEM] The interview has started. Greet the candidate, present the system design problem as described in your instructions, and ask them to begin by defining requirements or proposing their approach. Do NOT output a Mermaid diagram yet — wait for the candidate to describe components first.`);
                        hasConnectedOnceRef.current = true;
                    }
                }
            }, 1500);
        };

        client.onDisconnect = () => {
            // Involuntary disconnect — allow auto-reconnect
            shouldAutoReconnectRef.current = true;
        };

        clientRef.current = client;
        setClientReady(true);

        setAgentDisconnect(() => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        });

        return true;
    }, [handleToolsCall, setAgentDisconnect]);

    // Auto-initialize when hydration completes
    useEffect(() => {
        if (!hasHydrated) return;

        let cancelled = false;

        initClient().then((success) => {
            if (cancelled) return;
            if (!success) {
                console.error("Client initialization failed");
            }
        });

        return () => {
            cancelled = true;
            setClientReady(false);
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
            setAgentDisconnect(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasHydrated]);

    const handleStart = useCallback(async () => {
        setInitError(null);

        // If client was never created (init failed), re-attempt initialization
        if (!clientRef.current) {
            const success = await initClient();
            if (!success || !clientRef.current) return;
        }

        try {
            await clientRef.current.connect();
        } catch (err) {
            console.error("Error connecting:", err);
            setInitError(err instanceof Error ? err.message : 'Connection failed');
        }
    }, [initClient]);

    const handleStop = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    }, []);

    const handleToggleMute = useCallback(() => {
        if (clientRef.current) {
            const newMutedState = clientRef.current.toggleMicMute();
            setIsMicMuted(newMutedState);
        }
    }, []);

    // Auto-start when client is ready (first connect or auto-reconnect after drop)
    useEffect(() => {
        const canAutoStart = (status === 'disconnected' || status === 'error') && clientReady && clientRef.current;
        if (canAutoStart) {
            if (!hasConnectedOnceRef.current || shouldAutoReconnectRef.current) {
                shouldAutoReconnectRef.current = false;
                handleStart();
            }
        }
    }, [status, clientReady, handleStart]);

    return (
        <div id="agent-container" className="flex flex-col gap-4">
            {/* Init/Connection Error */}
            {initError && status !== 'connected' && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{initError}</span>
                </div>
            )}

            {/* Thinking Indicator */}
            {(isThinking || isModelSpeaking) && (
                <ThinkingIndicator isThinking={isThinking || isModelSpeaking} currentAction={currentAction} />
            )}

            {/* Microphone muted indicator */}
            {isMicMuted && status === 'connected' && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 flex items-center gap-2">
                    <MicOff className="w-3 h-3" />
                    Microphone muted
                </div>
            )}

            {/* Interruption feedback */}
            {wasInterrupted && !isMicMuted && (
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
                    <div className="flex gap-2">
                        <Button
                            variant={isMicMuted ? "default" : "outline"}
                            size="icon"
                            onClick={handleToggleMute}
                            title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
                        >
                            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                        <Button variant="destructive" size="icon" onClick={handleStop} title="Disconnect">
                            <MicOff className="w-4 h-4" />
                        </Button>
                    </div>
                ) : status === 'connecting' ? (
                    <Button variant="outline" disabled>
                        <Mic className="w-4 h-4 mr-2 animate-pulse" />
                        Connecting...
                    </Button>
                ) : (
                    <Button variant="default" onClick={handleStart}>
                        <Layers className="w-4 h-4 mr-2" />
                        Reconnect
                    </Button>
                )}
            </div>
        </div>
    );
}
