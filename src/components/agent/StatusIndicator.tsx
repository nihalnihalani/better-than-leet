import { cn } from "@/lib/utils";

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "disconnecting" | "error";

export function StatusIndicator({ status, isModelSpeaking }: { status: ConnectionStatus | string; isModelSpeaking?: boolean }) {
  const styles: Record<string, { color: string; dot: string; label: string }> = {
    connected: {
      color: isModelSpeaking
        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      dot: isModelSpeaking ? "bg-purple-500" : "bg-emerald-500",
      label: isModelSpeaking ? "Speaking..." : "Listening..."
    },
    connecting: {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      dot: "bg-yellow-500",
      label: "Connecting..."
    },
    disconnected: {
      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      dot: "bg-zinc-500",
      label: "Offline"
    },
    disconnecting: {
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      dot: "bg-orange-500",
      label: "Disconnecting..."
    },
    error: {
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      dot: "bg-red-500",
      label: "Error"
    }
  };

  const normalizedStatus = status.toLowerCase();
  const current = styles[normalizedStatus] || styles.disconnected;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm select-none",
        current.color
      )}
      role="status"
      aria-label={`Status: ${current.label}`}
    >
      <span className="relative flex h-2 w-2">
        {(normalizedStatus === 'connected' || normalizedStatus === 'connecting') && (
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            current.dot
          )}></span>
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          current.dot
        )}></span>
      </span>
      <span>{current.label}</span>
    </div>
  );
}
