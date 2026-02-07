'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Server,
  Database,
  Zap,
  List,
  GitBranch,
  Globe,
  HardDrive,
  Monitor,
  Cpu,
} from 'lucide-react';

export type SystemDesignNodeType =
  | 'service'
  | 'database'
  | 'cache'
  | 'queue'
  | 'loadbalancer'
  | 'cdn'
  | 'storage'
  | 'client'
  | 'worker';

interface NodeConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const NODE_CONFIG: Record<SystemDesignNodeType, NodeConfig> = {
  service: {
    icon: Server,
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/80',
    borderColor: 'border-blue-500/60',
  },
  database: {
    icon: Database,
    color: 'text-green-400',
    bgColor: 'bg-green-950/80',
    borderColor: 'border-green-500/60',
  },
  cache: {
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950/80',
    borderColor: 'border-yellow-500/60',
  },
  queue: {
    icon: List,
    color: 'text-orange-400',
    bgColor: 'bg-orange-950/80',
    borderColor: 'border-orange-500/60',
  },
  loadbalancer: {
    icon: GitBranch,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/80',
    borderColor: 'border-purple-500/60',
  },
  cdn: {
    icon: Globe,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/80',
    borderColor: 'border-cyan-500/60',
  },
  storage: {
    icon: HardDrive,
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/80',
    borderColor: 'border-gray-500/60',
  },
  client: {
    icon: Monitor,
    color: 'text-slate-300',
    bgColor: 'bg-slate-900/80',
    borderColor: 'border-slate-500/60',
  },
  worker: {
    icon: Cpu,
    color: 'text-red-400',
    bgColor: 'bg-red-950/80',
    borderColor: 'border-red-500/60',
  },
};

interface SystemDesignNodeData {
  label: string;
  subtitle?: string;
  nodeType: SystemDesignNodeType;
  [key: string]: unknown;
}

function SystemDesignNode({ data }: NodeProps) {
  const nodeData = data as SystemDesignNodeData;
  const nodeType = nodeData.nodeType || 'service';
  const config = NODE_CONFIG[nodeType] || NODE_CONFIG.service;
  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/40 !border-0" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-white/40 !border-0" />

      <div
        className={`px-4 py-3 rounded-lg border-2 ${config.bgColor} ${config.borderColor} shadow-lg backdrop-blur-sm min-w-[120px] transition-all duration-200`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
          <span className="text-sm font-medium text-white truncate">
            {nodeData.label}
          </span>
        </div>
        {nodeData.subtitle && (
          <p className="text-[10px] text-white/50 mt-1 truncate">{nodeData.subtitle}</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/40 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-white/40 !border-0" />
    </>
  );
}

export const MemoizedSystemDesignNode = memo(SystemDesignNode);

export const customNodeTypes = {
  systemDesign: MemoizedSystemDesignNode,
};
