import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  message: string;
  source: string;
}

export function TerminalLog({ logs }: { logs: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO": return "text-blue-400";
      case "WARN": return "text-yellow-400";
      case "ERROR": return "text-red-500";
      case "SUCCESS": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-black border border-border rounded-lg overflow-hidden font-mono text-xs shadow-2xl">
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
          <span className="ml-2 text-muted-foreground">SYSTEM LOGS</span>
        </div>
        <div className="text-[10px] text-primary animate-pulse">● LIVE STREAM</div>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-[300px] overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        {logs.length === 0 && (
          <div className="text-muted-foreground italic opacity-50 text-center mt-20">Waiting for incoming signals...</div>
        )}
        
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 hover:bg-white/5 p-0.5 rounded transition-colors group">
            <span className="text-muted-foreground opacity-50 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={cn("font-bold w-16 shrink-0", getLevelColor(log.level))}>{log.level}</span>
            <span className="text-accent-foreground/80 shrink-0 w-24 border-r border-white/10 pr-2 mr-2 text-right hidden sm:block">
              {log.source}
            </span>
            <span className="text-foreground/90 group-hover:text-white transition-colors break-all">
              {log.message}
            </span>
          </div>
        ))}
        <div className="animate-pulse text-primary mt-2">_</div>
      </div>
    </div>
  );
}
