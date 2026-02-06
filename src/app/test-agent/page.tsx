'use client';

import { useState, useRef, useEffect } from 'react';
import { GeminiLiveClient, ConnectionStatus } from '@/lib/gemini-live-client';

export default function TestAgentPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [testText, setTestText] = useState('Hello! This is a test of the Gemini Live voice system.');
    const clientRef = useRef<GeminiLiveClient | null>(null);

    const addLog = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            addLog('Gemini API Key not found in environment');
            return;
        }

        const client = new GeminiLiveClient(apiKey.trim());

        client.onStatusChange = (s) => {
            setStatus(s);
            addLog(`Status: ${s}`);
        };

        client.onMessage = (msg) => {
            addLog(`Model response: ${msg}`);
        };

        client.onError = (err) => {
            addLog(`Error: ${err.message}`);
        };

        client.onToolsCall = async (calls) => {
            addLog(`Tool calls received: ${JSON.stringify(calls)}`);
            return calls.map(c => ({
                name: c.name,
                response: { result: 'Mock tool response' }
            }));
        };

        clientRef.current = client;

        return () => {
            client.disconnect();
        };
    }, []);

    const handleStart = async () => {
        addLog('Starting Gemini Live session...');
        if (clientRef.current) {
            await clientRef.current.connect();
        }
    };

    const handleStop = () => {
        addLog('Stopping session...');
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    };

    const handleSendText = () => {
        if (clientRef.current?.isConnected()) {
            addLog(`Sending text: "${testText}"`);
            clientRef.current.sendText(testText);
        } else {
            addLog('Not connected - cannot send text');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Gemini Live Agent Test</h1>

                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' :
                                    status === 'connecting' ? 'bg-yellow-500' :
                                        status === 'error' ? 'bg-red-500' :
                                            'bg-gray-500'
                                }`}></div>
                            <span className="font-semibold">Status: {status}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-4">
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

                    {status === 'connected' && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                            <label className="block mb-2 text-sm font-medium">Send Text to Speak:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={testText}
                                    onChange={(e) => setTestText(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-600 rounded-lg text-white"
                                    placeholder="Enter text to speak..."
                                />
                                <button
                                    onClick={handleSendText}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                                >
                                    Speak
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Console Logs</h2>
                    <div className="bg-black p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">No logs yet. Click &quot;Start Test&quot; to begin.</p>
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
                        This is a minimal test for Gemini Live connection. It tests the WebSocket connection,
                        microphone input, audio output, and text-to-speech functionality.
                    </p>
                </div>
            </div>
        </div>
    );
}
