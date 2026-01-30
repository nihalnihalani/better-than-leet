'use client';

import { useConversation } from '@elevenlabs/react';
import { useState } from 'react';

export default function TestAgentPage() {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const conversation = useConversation({
        onConnect: () => {
            addLog('✅ Connected to ElevenLabs');
        },
        onDisconnect: () => {
            addLog('❌ Disconnected from ElevenLabs');
        },
        onMessage: (message: any) => {
            addLog(`📩 Message received: ${JSON.stringify(message)}`);
        },
        onError: (err: any) => {
            addLog(`❌ Error: ${JSON.stringify(err)}`);
        },
        onStatusChange: (status: any) => {
            addLog(`🔄 Status: ${status.status}`);
        },
    });

    const { status, isSpeaking, startSession, endSession } = conversation;

    const handleStart = async () => {
        addLog('🎯 Starting test session...');
        addLog(`Agent ID: ${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`);

        try {
            addLog('📱 Requesting microphone access...');
            await navigator.mediaDevices.getUserMedia({ audio: true });
            addLog('✅ Microphone granted');

            addLog('🚀 Starting ElevenLabs session (no tools)...');
            await (startSession as any)({
                agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
            });

            addLog('✅ Session started');
        } catch (err: any) {
            addLog(`❌ Failed: ${err.message}`);
        }
    };

    const handleStop = async () => {
        addLog('🛑 Stopping session...');
        await endSession();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">ElevenLabs Agent Test</h1>

                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' :
                                    status === 'connecting' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}></div>
                            <span className="font-semibold">Status: {status}</span>
                        </div>
                        {isSpeaking && <span className="text-blue-400">🎙️ Speaking...</span>}
                    </div>

                    <div className="flex gap-4">
                        {status === 'connected' ? (
                            <button
                                onClick={handleStop}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                            >
                                Stop Session
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                disabled={status === 'connecting'}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold transition"
                            >
                                {status === 'connecting' ? 'Connecting...' : 'Start Test'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Console Logs</h2>
                    <div className="bg-black p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">No logs yet. Click "Start Test" to begin.</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Test Purpose</h3>
                    <p className="text-sm text-gray-300">
                        This is a minimal test with NO client tools. If this also disconnects immediately,
                        the issue is with the ElevenLabs agent configuration, not the app code.
                    </p>
                </div>
            </div>
        </div>
    );
}
