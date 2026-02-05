import { useState } from "react";
import { useAgents } from "@/hooks/use-agents";
import { useAgentLogs, useAnalyzeLogs } from "@/hooks/use-logs";
import { Layout } from "@/components/Layout";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { FileText, Search, Activity, AlertTriangle, Info, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function LogAnalysis() {
  const { data: agents = [] } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const { data: logs = [] } = useAgentLogs(selectedAgentId || "");
  const { mutate: analyze, isPending: isAnalyzing, data: analysisResult } = useAnalyzeLogs();

  const handleAnalyze = () => {
    if (!selectedAgentId) return;
    analyze({ agentId: selectedAgentId, limit: 50 });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
        {/* Top Bar: Selector & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="text-sm font-mono text-muted-foreground uppercase">Target Node:</div>
             <select 
               className="bg-black border border-border rounded px-4 py-2 font-mono text-white min-w-[200px] focus:border-primary focus:outline-none"
               onChange={(e) => setSelectedAgentId(e.target.value)}
               value={selectedAgentId || ""}
             >
               <option value="" disabled>-- SELECT NODE --</option>
               {agents.map(a => (
                 <option key={a.id} value={a.id}>{a.hostname} ({a.status})</option>
               ))}
             </select>
           </div>
           
           <CyberButton 
             onClick={handleAnalyze} 
             disabled={!selectedAgentId || logs.length === 0}
             isLoading={isAnalyzing}
             icon={<Bot className="w-4 h-4" />}
           >
             RUN AI DIAGNOSTICS
           </CyberButton>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Logs Table */}
          <CyberCard className="lg:col-span-2 p-0 flex flex-col overflow-hidden" title="SYSTEM LOGS">
             <div className="p-2 border-b border-border bg-black/20 flex gap-2">
                <Search className="w-4 h-4 text-muted-foreground my-auto ml-2" />
                <input 
                  placeholder="Grep logs..." 
                  className="bg-transparent border-none text-sm font-mono w-full focus:outline-none text-white"
                />
             </div>
             
             <div className="flex-1 overflow-auto bg-black font-mono text-xs">
               {!selectedAgentId ? (
                 <div className="h-full flex items-center justify-center text-muted-foreground italic">
                   Select a target to view telemetry.
                 </div>
               ) : logs.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-muted-foreground italic">
                   No logs recorded for this unit.
                 </div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead className="sticky top-0 bg-card border-b border-border z-10">
                     <tr className="text-muted-foreground">
                       <th className="p-3 w-32">TIMESTAMP</th>
                       <th className="p-3 w-20">LEVEL</th>
                       <th className="p-3">MESSAGE</th>
                     </tr>
                   </thead>
                   <tbody>
                     {logs.map((log) => (
                       <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                         <td className="p-3 text-muted-foreground">
                           {log.timestamp ? format(new Date(log.timestamp), "HH:mm:ss.SSS") : "-"}
                         </td>
                         <td className="p-3">
                           <span className={cn(
                             "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border",
                             log.level === 'error' ? "border-red-500/50 text-red-500 bg-red-500/10" :
                             log.level === 'warn' ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/10" :
                             "border-blue-500/50 text-blue-500 bg-blue-500/10"
                           )}>
                             {log.level}
                           </span>
                         </td>
                         <td className="p-3 text-white/90 break-all">{log.message}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
          </CyberCard>

          {/* AI Insights */}
          <CyberCard title="INTELLIGENCE REPORT" icon={<Activity />} className="border-primary/20 bg-primary/5">
             <div className="h-full flex flex-col overflow-auto pr-2">
               {!analysisResult ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground/50 gap-4">
                   <Bot className="w-16 h-16 opacity-20" />
                   <p className="font-mono text-sm max-w-[200px]">
                     Neural engine standby. Initiate diagnostics to process telemetry.
                   </p>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                      <h4 className="text-primary font-bold font-display flex items-center gap-2 border-b border-primary/20 pb-1">
                        <AlertTriangle className="w-4 h-4" />
                        DETECTED ANOMALIES
                      </h4>
                      {analysisResult.anomalies.length > 0 ? (
                        <ul className="space-y-2">
                          {analysisResult.anomalies.map((anomaly, idx) => (
                            <li key={idx} className="bg-destructive/10 border border-destructive/30 p-2 rounded text-xs font-mono text-destructive-foreground">
                              ! {anomaly}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-green-500 text-xs font-mono flex items-center gap-2">
                          <CheckIcon className="w-3 h-3" /> No anomalies detected.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-primary font-bold font-display flex items-center gap-2 border-b border-primary/20 pb-1">
                        <Info className="w-4 h-4" />
                        SUMMARY ANALYSIS
                      </h4>
                      <p className="text-sm font-mono text-white/80 leading-relaxed whitespace-pre-line">
                        {analysisResult.analysis}
                      </p>
                    </div>
                 </div>
               )}
             </div>
          </CyberCard>
        </div>
      </div>
    </Layout>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
