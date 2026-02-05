import { useLogs } from "@/hooks/use-logs";
import { LayoutShell } from "@/components/layout-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Logs() {
  const { data: logs, isLoading } = useLogs();
  const [filter, setFilter] = useState("");

  const filteredLogs = logs?.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.level.includes(filter.toLowerCase())
  );

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return AlertCircle;
      case 'warn': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getColor = (level: string) => {
    switch (level) {
      case 'error': return "text-red-400";
      case 'warn': return "text-yellow-400";
      case 'success': return "text-green-400";
      default: return "text-blue-400";
    }
  };

  return (
    <LayoutShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">System Logs</h2>
          <p className="text-muted-foreground font-mono text-xs mt-1">Audit trail and activity history</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Filter logs..." 
            className="pl-9 bg-black/20 border-border font-mono text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-card/50 border-border h-[calc(100vh-220px)] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-6 bg-white/5 rounded w-full" />
              ))}
            </div>
          ) : (
            <div className="font-mono text-sm space-y-1">
              {filteredLogs?.map((log) => {
                const Icon = getIcon(log.level);
                const colorClass = getColor(log.level);
                return (
                  <div key={log.id} className="flex gap-4 p-2 hover:bg-white/5 rounded group transition-colors border border-transparent hover:border-white/5">
                    <span className="text-muted-foreground opacity-50 w-36 shrink-0 text-xs pt-0.5">
                      {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : '-'}
                    </span>
                    <div className={cn("flex items-center gap-2 w-24 shrink-0 font-bold uppercase text-xs pt-0.5", colorClass)}>
                      <Icon className="w-3 h-3" />
                      {log.level}
                    </div>
                    <span className="text-gray-300 break-all">{log.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </LayoutShell>
  );
}
