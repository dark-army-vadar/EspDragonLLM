import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "busy" | "error" | "pending" | "completed" | "running" | "failed";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    online: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    offline: "bg-muted text-muted-foreground border-border",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    busy: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    running: "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const normalizedStatus = status.toLowerCase();
  const style = styles[normalizedStatus] || styles.offline;

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono border uppercase tracking-wide",
      style
    )}>
      {status}
    </span>
  );
}
