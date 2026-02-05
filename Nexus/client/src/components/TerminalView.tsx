import { useEffect, useRef } from "react";
import { Command } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TerminalViewProps {
  commands: Command[];
  className?: string;
}

export function TerminalView({ commands, className }: TerminalViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commands]);

  return (
    <div className={cn("bg-black border border-border p-4 font-mono text-sm overflow-auto rounded", className)}>
      <div className="space-y-4">
        {commands.length === 0 && (
          <div className="text-muted-foreground italic opacity-50 text-center py-10">
            // No commands executed yet. Waiting for input...
          </div>
        )}
        
        {commands.map((cmd) => (
          <div key={cmd.id} className="space-y-1 group">
            <div className="flex gap-2 text-muted-foreground/80 text-xs select-none">
              <span>[{cmd.createdAt ? format(new Date(cmd.createdAt), "HH:mm:ss") : "--:--:--"}]</span>
              <span>ID: {cmd.id}</span>
              <span className={cn(
                "uppercase font-bold ml-2",
                cmd.status === "completed" ? "text-green-500" :
                cmd.status === "failed" ? "text-red-500" : 
                "text-yellow-500"
              )}>
                {cmd.status}
              </span>
            </div>
            
            <div className="flex gap-2">
              <span className="text-primary font-bold select-none">$</span>
              <span className="text-white">{cmd.command}</span>
            </div>
            
            {cmd.output && (
              <div className="pl-4 border-l-2 border-border/50 ml-1 mt-1 text-green-400/90 whitespace-pre-wrap break-all">
                {cmd.output}
              </div>
            )}
            
            {cmd.status === "failed" && !cmd.output && (
              <div className="pl-4 text-red-500 italic">Command failed to execute.</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
