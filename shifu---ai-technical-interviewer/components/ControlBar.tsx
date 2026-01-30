import React from 'react';
import { ConnectionState } from '../types';
import { Mic, MicOff, Power, Play, Volume2 } from 'lucide-react';

interface ControlBarProps {
  status: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
  onRunCode: () => void;
  isMicOn: boolean;
  volume: number;
}

const ControlBar: React.FC<ControlBarProps> = ({ 
  status, 
  onConnect, 
  onDisconnect, 
  onRunCode,
  isMicOn,
  volume
}) => {
  const isConnected = status === ConnectionState.CONNECTED;

  return (
    <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
          status === ConnectionState.CONNECTED ? 'bg-green-500/10 border-green-500/50 text-green-400' :
          status === ConnectionState.CONNECTING ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' :
          status === ConnectionState.ERROR ? 'bg-red-500/10 border-red-500/50 text-red-400' :
          'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === ConnectionState.CONNECTED ? 'bg-green-400 animate-pulse' :
            status === ConnectionState.CONNECTING ? 'bg-yellow-400 animate-bounce' :
            status === ConnectionState.ERROR ? 'bg-red-400' :
            'bg-slate-500'
          }`} />
          {status}
        </div>

        {isConnected && (
            <div className="flex items-center gap-2 ml-4">
               <Volume2 size={16} className="text-slate-400"/>
               {/* Simple Visualizer */}
               <div className="flex items-center gap-0.5 h-6">
                 {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1 bg-blue-500 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(20, Math.min(100, volume * 500 * (Math.random() + 0.5)))}%` }}
                    />
                 ))}
               </div>
            </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRunCode}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors text-sm font-medium"
        >
          <Play size={16} /> Run Code
        </button>

        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/50 transition-colors text-sm font-medium"
          >
            <Power size={16} /> End Interview
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={status === ConnectionState.CONNECTING}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {status === ConnectionState.CONNECTING ? 'Connecting...' : 'Start Interview'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ControlBar;