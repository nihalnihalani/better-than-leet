'use client';

import { useBehavioralStore } from '@/lib/behavioral-store';
import { useInterviewStore } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { StatusIndicator } from './StatusIndicator';
import { Visualizer } from './Visualizer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { Mic, MicOff, Users, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getBehavioralTools } from '@/lib/behavioral-agent-tools';
import { GeminiLiveClient, ConnectionStatus } from '@/lib/gemini-live-client';
import { authFetch, initSession } from '@/lib/api-client';

export function BehavioralAgent() {
    const { setAgentDisconnect } = useBehavioralStore();
    const hasHydrated = useBehavioralStore((s) => s._hasHydrated);
    const [isThinking, setIsThinking] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleToolsCall = useCallback(async (functionCalls: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (functionCalls.some((c: any) => c.name === 'end_interview') && clientRef.current) {
            clientRef.current.markInterviewEnding();
        }

        const toolFunctions = getBehavioralTools();
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

    const initClient = useCallback(async (): Promise<boolean> => {
        setInitError(null);

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

        const client = new GeminiLiveClient(apiKey.trim(), 'behavioral');

        const topicId = useBehavioralStore.getState().selectedTopicId;
        if (topicId) {
            client.setBehavioralTopic(topicId);
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
            console.error("Behavioral Client Error:", err);
            setInitError(err.message);
            setIsThinking(false);
            setCurrentAction('');
        };
        client.onMessage = (msg) => {
            useBehavioralStore.getState().addTranscriptMessage('agent', msg, 'audio');
        };
        client.onUserTranscript = (text) => {
            useBehavioralStore.getState().addTranscriptMessage('user', text, 'audio');
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
                        client.sendText(`[CONTEXT RECOVERY] The connection was briefly interrupted. Resume the interview from where we left off. Do NOT re-introduce the topic or re-greet the candidate.`);
                    } else {
                        client.sendText(`[SYSTEM] The behavioral interview has started. Greet the candidate warmly, introduce the topic as described in your instructions, and ask your first behavioral question. Remember: one question at a time, use the STAR method to evaluate responses.`);
                        hasConnectedOnceRef.current = true;
                    }
                }
            }, 1500);
        };

        client.onDisconnect = () => {
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
            {initError && status !== 'connected' && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{initError}</span>
                </div>
            )}

            {(isThinking || isModelSpeaking) && (
                <ThinkingIndicator isThinking={isThinking || isModelSpeaking} currentAction={currentAction} />
            )}

            {isMicMuted && status === 'connected' && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 flex items-center gap-2">
                    <MicOff className="w-3 h-3" />
                    Microphone muted
                </div>
            )}

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
                        <Users className="w-4 h-4 mr-2" />
                        Reconnect
                    </Button>
                )}
            </div>
        </div>
    );
}
