import { useAgents } from "@/hooks/use-agents";
import { Layout } from "@/components/Layout";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { Server, Activity, AlertTriangle, Smartphone, Monitor } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: agents = [], isLoading } = useAgents();
  const [, setLocation] = useLocation();

  const onlineAgents = agents.filter(a => a.status === "online").length;
  const offlineAgents = agents.length - onlineAgents;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-1">Mission Control</h2>
            <p className="text-muted-foreground font-mono">Overview of all active neural links.</p>
          </div>
          <CyberButton onClick={() => setLocation("/builder")} icon={<Activity className="w-4 h-4" />}>
            New Operation
          </CyberButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CyberCard delay={1}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">TOTAL NODES</p>
                <p className="text-4xl font-display font-bold text-white mt-1">{agents.length}</p>
              </div>
              <Server className="w-10 h-10 text-primary/50" />
            </div>
          </CyberCard>
          
          <CyberCard delay={2}>
             <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">ONLINE</p>
                <p className="text-4xl font-display font-bold text-primary mt-1 text-glow">{onlineAgents}</p>
              </div>
              <Activity className="w-10 h-10 text-primary/50 animate-pulse" />
            </div>
          </CyberCard>

          <CyberCard delay={3}>
             <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">OFFLINE</p>
                <p className="text-4xl font-display font-bold text-destructive mt-1">{offlineAgents}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive/50" />
            </div>
          </CyberCard>
          
          <CyberCard delay={4} className="bg-primary/5 border-primary/20">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-primary/80">SYSTEM STATUS</p>
                <p className="text-lg font-bold text-primary mt-2 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                   OPERATIONAL
                </p>
              </div>
              <ShieldCheckIcon className="w-10 h-10 text-primary/50" />
            </div>
          </CyberCard>
        </div>

        {/* Agents Table */}
        <CyberCard title="CONNECTED NODES" icon={<Server />} className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-t-2 border-primary rounded-full" />
            </div>
          ) : agents.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground font-mono">
                NO AGENTS DETECTED. DEPLOY PAYLOAD TO TARGETS.
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground font-mono text-sm">
                    <th className="p-4">STATUS</th>
                    <th className="p-4">HOSTNAME</th>
                    <th className="p-4">OS</th>
                    <th className="p-4">LAST SEEN</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b border-border/30 hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]", 
                             agent.status === 'online' ? "bg-green-500 text-green-500" : "bg-red-500 text-red-500"
                           )} />
                           <span className={cn(
                             "text-xs uppercase", 
                             agent.status === 'online' ? "text-green-500" : "text-red-500"
                           )}>{agent.status}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">{agent.hostname}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           {agent.os.toLowerCase().includes('android') ? (
                             <Smartphone className="w-4 h-4 text-blue-400" />
                           ) : (
                             <Monitor className="w-4 h-4 text-purple-400" />
                           )}
                           <span className="uppercase text-sm">{agent.os}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {agent.lastSeen ? formatDistanceToNow(new Date(agent.lastSeen), { addSuffix: true }) : 'Never'}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/commands?agent=${agent.id}`}>
                           <button className="text-primary hover:text-white hover:underline text-xs uppercase tracking-wider">
                              &gt; Terminal
                           </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CyberCard>
      </div>
    </Layout>
  );
}

function ShieldCheckIcon(props: any) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
