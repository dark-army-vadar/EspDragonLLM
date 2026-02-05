import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAgents } from "@/hooks/use-agents";
import { useCommands, useCreateCommand } from "@/hooks/use-commands";
import { Layout } from "@/components/Layout";
import { CyberCard } from "@/components/CyberCard";
import { TerminalView } from "@/components/TerminalView";
import { Terminal, Send, Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommandCenter() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialAgentId = searchParams.get("agent");
  
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(initialAgentId);
  const [cmdInput, setCmdInput] = useState("");

  const { data: agents = [] } = useAgents();
  const { data: commands = [] } = useCommands(selectedAgentId || undefined);
  const { mutate: createCommand, isPending } = useCreateCommand();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim() || !selectedAgentId) return;

    createCommand({
      agentId: selectedAgentId,
      command: cmdInput.trim(),
    });
    setCmdInput("");
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
        
        {/* Sidebar: Agents List */}
        <CyberCard className="w-full md:w-72 flex flex-col p-0 overflow-hidden" title="TARGETS">
           <div className="p-4 border-b border-border bg-black/20">
             <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <input 
                  placeholder="Filter targets..." 
                  className="w-full bg-black border border-border rounded pl-8 pr-2 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                />
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {agents.map(agent => (
               <button
                 key={agent.id}
                 onClick={() => setSelectedAgentId(agent.id)}
                 className={cn(
                   "w-full text-left px-3 py-3 rounded border border-transparent font-mono text-sm transition-all duration-200 flex items-center justify-between group",
                   selectedAgentId === agent.id 
                     ? "bg-primary/10 border-primary text-primary" 
                     : "hover:bg-white/5 hover:text-white text-muted-foreground"
                 )}
               >
                 <div className="flex flex-col">
                    <span className="font-bold">{agent.hostname}</span>
                    <span className="text-[10px] opacity-70 uppercase">{agent.os}</span>
                 </div>
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   agent.status === 'online' ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-red-500"
                 )} />
               </button>
             ))}
           </div>
        </CyberCard>

        {/* Main: Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
           {!selectedAgent ? (
             <CyberCard className="flex-1 flex items-center justify-center border-dashed">
                <div className="text-center text-muted-foreground">
                   <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                   <h3 className="text-xl font-display text-white">NO TARGET SELECTED</h3>
                   <p className="font-mono mt-2">Select a node from the list to initialize connection.</p>
                </div>
             </CyberCard>
           ) : (
             <CyberCard className="flex-1 flex flex-col p-0 overflow-hidden border-primary/30">
                {/* Terminal Header */}
                <div className="h-10 bg-black/40 border-b border-border flex items-center px-4 justify-between shrink-0">
                   <div className="flex items-center gap-2 text-sm font-mono text-primary">
                      <Terminal className="w-4 h-4" />
                      <span>SSH: {selectedAgent.hostname}</span>
                      <span className="text-muted-foreground">({selectedAgent.id.substring(0,8)})</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className={cn(
                         "text-[10px] px-2 py-0.5 rounded uppercase font-bold",
                         selectedAgent.status === 'online' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      )}>
                         {selectedAgent.status}
                      </span>
                   </div>
                </div>
                
                {/* Terminal Output */}
                <TerminalView commands={commands} className="flex-1 rounded-none border-x-0 border-t-0" />
                
                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-border flex gap-2">
                   <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-primary font-bold font-mono">$</span>
                      <input 
                         type="text"
                         value={cmdInput}
                         onChange={(e) => setCmdInput(e.target.value)}
                         placeholder="Enter command..."
                         className="w-full bg-black border border-border rounded pl-8 pr-12 py-3 font-mono text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                         disabled={isPending}
                         autoFocus
                      />
                      <div className="absolute right-3 top-3 text-xs text-muted-foreground font-mono opacity-50 pointer-events-none">
                         ENTER
                      </div>
                   </div>
                   <button 
                     type="submit" 
                     disabled={isPending || !cmdInput.trim()}
                     className="bg-primary/10 border border-primary text-primary px-4 rounded hover:bg-primary hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                </form>
             </CyberCard>
           )}
        </div>
      </div>
    </Layout>
  );
}
