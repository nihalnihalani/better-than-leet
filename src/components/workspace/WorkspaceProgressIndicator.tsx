'use client';

import { useInterviewStore, WorkspaceStatus } from '@/lib/store';
import { Loader2, CheckCircle, AlertCircle, Server, Package, Cpu, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProgressStep {
  key: WorkspaceStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: ProgressStep[] = [
  { key: 'creating', label: 'Creating sandbox environment', icon: Server },
  { key: 'installing', label: 'Installing development tools', icon: Package },
  { key: 'ready', label: 'Environment ready', icon: Cpu },
];

interface WorkspaceProgressIndicatorProps {
  onRetry?: () => void;
}

export function WorkspaceProgressIndicator({ onRetry }: WorkspaceProgressIndicatorProps) {
  const { workspaceStatus, workspaceProgress, workspaceError } = useInterviewStore();

  // Don't show if ready or idle (not started)
  if (workspaceStatus === 'ready') return null;
  if (workspaceStatus === 'idle') return null;

  const currentStepIndex = STEPS.findIndex(s => s.key === workspaceStatus);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border rounded-xl p-6 w-[400px] shadow-2xl">
        <h2 className="text-lg font-semibold mb-2">Initializing Your Environment</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Setting up a secure coding sandbox for your interview...
        </p>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = workspaceStatus === step.key;
            const isComplete = currentStepIndex > index;
            const isPending = currentStepIndex < index && workspaceStatus !== 'error';
            const isError = workspaceStatus === 'error' && currentStepIndex === index;

            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  isActive && "bg-blue-500/10 border border-blue-500/30",
                  isComplete && "text-green-500",
                  isPending && "text-muted-foreground opacity-50",
                  isError && "bg-red-500/10 border border-red-500/30 text-red-400"
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={cn(
                    "font-medium",
                    isActive && "text-blue-500",
                    isError && "text-red-400"
                  )}>
                    {step.label}
                  </span>
                  {isActive && workspaceProgress.step && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {workspaceProgress.step}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        {workspaceStatus !== 'error' && (
          <div className="mt-6">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{
                  width: `${workspaceProgress.progress}%`
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {workspaceProgress.progress}% complete
            </p>
          </div>
        )}

        {/* Error state */}
        {workspaceStatus === 'error' && workspaceError && (
          <div className="mt-6">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-400">Initialization Failed</p>
                  <p className="text-sm text-red-400/80 mt-1">{workspaceError}</p>
                </div>
              </div>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        )}

        {/* Helpful tips */}
        {workspaceStatus !== 'error' && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              This usually completes in under a minute. Your sandbox includes Python, pip, and common development tools.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
