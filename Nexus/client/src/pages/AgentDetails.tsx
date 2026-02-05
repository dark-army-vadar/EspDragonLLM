import { useRoute } from "wouter";
import { useAgent, useDeleteAgent } from "@/hooks/use-agents";
import { useTasks } from "@/hooks/use-tasks";
import { LayoutShell } from "@/components/layout-shell";
import { StatusBadge } from "@/components/status-badge";
import { CreateTaskModal } from "@/components/create-task-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, Shield, Cpu, Network, Clock, 
  Trash2, ArrowLeft, Activity, HardDrive 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AgentDetails() {
  const [match, params] = useRoute("/agents/:id");
  const agentId = params?.id || "";
  const { data: agent, isLoading } = useAgent(agentId);
  const { data: tasks } = useTasks(agentId);
  const { mutate: deleteAgent } = useDeleteAgent();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="text-white p-8">Loading agent data...</div>;
  if (!agent) return <div className="text-white p-8">Agent not found</div>;

  const handleDelete = () => {
    deleteAgent(agentId, {
      onSuccess: () => setLocation("/agents")
    });
  };

  return (
    <LayoutShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agents">
              <Button variant="outline" size="icon" className="h-10 w-10 border-border bg-card/50 hover:bg-card">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-display text-white">{agent.hostname}</h2>
                <StatusBadge status={agent.status} />
              </div>
              <p className="text-muted-foreground font-mono text-xs mt-1 flex items-center gap-2">
                <Network className="w-3 h-3" /> {agent.ipAddress}
                <span className="text-border">|</span>
                <Clock className="w-3 h-3" /> Last seen: {new Date(agent.lastSeen!).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreateTaskModal defaultAgentId={agentId} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Disconnect Agent?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will remove the agent from the registry. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-border text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Disconnect</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task History</TabsTrigger>
            <TabsTrigger value="terminal">Terminal Session</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> System Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-muted-foreground">OS</span>
                    <span className="text-sm text-white font-mono">{agent.os || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm text-white font-mono">{agent.version}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-muted-foreground">Agent ID</span>
                    <span className="text-sm text-white font-mono">{agent.id}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" /> Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="text-white">24%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[24%]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Memory</span>
                      <span className="text-white">1.2GB / 8GB</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[15%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase text-muted-foreground flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" /> Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center border-t-primary rotate-45">
                       <span className="text-xs font-bold text-white -rotate-45">45%</span>
                     </div>
                     <div className="space-y-1">
                       <p className="text-sm text-white font-mono">/dev/sda1</p>
                       <p className="text-xs text-muted-foreground">234GB Free</p>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {tasks?.map(task => (
                    <div key={task.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={task.status} />
                          <span className="text-sm font-mono text-white bg-white/10 px-2 py-0.5 rounded">{task.type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(task.createdAt!).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-black/40 rounded p-3 font-mono text-xs text-gray-300 mb-2 border border-white/5">
                        $ {task.payload}
                      </div>
                      {task.result && (
                        <div className="bg-black/60 rounded p-3 font-mono text-xs text-primary/80 border-l-2 border-primary">
                          <pre className="whitespace-pre-wrap">{task.result}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terminal Tab */}
          <TabsContent value="terminal">
            <Card className="bg-black border-border shadow-inner">
              <CardHeader className="bg-white/5 border-b border-white/5 py-2">
                <div className="flex items-center gap-2">
                   <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                   </div>
                   <span className="text-xs font-mono text-muted-foreground ml-2">root@{agent.hostname}:~</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 min-h-[400px] font-mono text-sm text-primary/90 space-y-2">
                <div>Welcome to Nexus C2 Terminal Interface v2.0</div>
                <div>Connected to {agent.hostname} ({agent.ipAddress})</div>
                <div>Encryption: AES-256-GCM</div>
                <div className="opacity-50">----------------------------------------</div>
                {tasks?.slice(0, 5).map(task => (
                  <div key={task.id}>
                    <div className="text-white">$ {task.payload}</div>
                    {task.result && <div className="text-muted-foreground">{task.result}</div>}
                  </div>
                ))}
                <div className="flex items-center gap-2 animate-pulse">
                  <span className="text-white">$</span>
                  <div className="w-2 h-4 bg-primary" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}
