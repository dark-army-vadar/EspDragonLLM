import { DeviceResponse } from "@shared/schema";
import { Laptop, Smartphone, Tablet, Radio, Power, Terminal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteDevice } from "@/hooks/use-devices";
import { useCommands, useExecuteCommand } from "@/hooks/use-commands";
import { useToast } from "@/hooks/use-toast";

const iconMap = {
  android: Smartphone,
  ios: Tablet,
  windows: Laptop,
  linux: Terminal,
  iot: Radio,
};

export function DeviceGrid({ devices }: { devices: DeviceResponse[] }) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(null);
  const [shellOpen, setShellOpen] = useState(false);
  const [command, setCommand] = useState("");
  
  const deleteMutation = useDeleteDevice();
  const executeMutation = useExecuteCommand();
  const { toast } = useToast();
  
  // Real-time command logs for the selected device
  const { data: commandHistory } = useCommands(selectedDevice?.id);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to terminate this node? This action is irreversible.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExecute = () => {
    if (!selectedDevice || !command.trim()) return;
    
    executeMutation.mutate({
      deviceId: selectedDevice.id,
      command: command,
      type: 'shell',
    }, {
      onSuccess: () => {
        setCommand("");
        toast({ title: "Command Sent", description: "Execution pending on remote node." });
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => {
          const Icon = iconMap[device.platform as keyof typeof iconMap] || Laptop;
          const isOnline = device.status === 'online';
          const isBusy = device.status === 'busy';

          return (
            <div 
              key={device.id}
              onClick={() => { setSelectedDevice(device); setShellOpen(true); }}
              className={cn(
                "group relative bg-card/80 border border-border/50 rounded-lg p-5 cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]",
                isOnline ? "hover:-translate-y-1" : "opacity-70 grayscale"
              )}
            >
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-widest",
                  isOnline ? "text-primary" : "text-muted-foreground"
                )}>
                  {device.status}
                </span>
                <div className={cn(
                  "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                  isOnline ? (isBusy ? "bg-yellow-500 text-yellow-500 animate-pulse" : "bg-primary text-primary animate-pulse") : "bg-red-500/50 text-red-500"
                )} />
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                  "p-3 rounded bg-black/40 border border-white/5",
                  isOnline ? "text-primary" : "text-muted-foreground"
                )}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {device.name}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">ID: {device.serial}</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs text-muted-foreground border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span>IP ADDRESS</span>
                  <span className="text-foreground">{device.ipAddress || 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between">
                  <span>PLATFORM</span>
                  <span className="uppercase">{device.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>BATTERY</span>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", device.batteryLevel && device.batteryLevel < 20 ? "bg-red-500" : "bg-primary")} 
                      style={{ width: `${device.batteryLevel}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <Button 
                   size="icon" 
                   variant="destructive" 
                   className="h-8 w-8 rounded-full"
                   onClick={(e) => handleDelete(e, device.id)}
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
              </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none" />
            </div>
          );
        })}
      </div>

      <Dialog open={shellOpen} onOpenChange={setShellOpen}>
        <DialogContent className="max-w-4xl bg-black border-primary/20 p-0 overflow-hidden font-mono shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)]">
          <DialogHeader className="px-4 py-2 bg-muted/20 border-b border-white/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <DialogTitle className="font-mono text-sm tracking-widest text-primary/80">
                REMOTE_SHELL :: {selectedDevice?.serial} @ {selectedDevice?.ipAddress}
              </DialogTitle>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
          </DialogHeader>

          <div className="h-[400px] bg-black p-4 overflow-y-auto font-mono text-xs space-y-2">
            <div className="text-muted-foreground opacity-50">Checking connection... ESTABLISHED.</div>
            <div className="text-muted-foreground opacity-50">Handshake complete. Encryption: AES-256.</div>
            <br />
            {commandHistory?.map((cmd) => (
              <div key={cmd.id} className="space-y-1">
                <div className="flex gap-2 text-foreground/80">
                  <span className="text-primary">root@nexus:~#</span>
                  <span>{cmd.command}</span>
                </div>
                {cmd.output && (
                  <pre className="text-muted-foreground pl-4 whitespace-pre-wrap font-inherit">{cmd.output}</pre>
                )}
                {cmd.status === 'pending' && (
                  <div className="pl-4 text-yellow-500/50 animate-pulse">Processing...</div>
                )}
              </div>
            ))}
          </div>

          <div className="p-2 bg-muted/10 border-t border-white/10 flex gap-2">
            <span className="text-primary py-2 pl-2">root@nexus:~#</span>
            <input 
              className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder:text-muted-foreground/30"
              placeholder="Enter command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              autoFocus
            />
            <Button 
              size="sm" 
              className="bg-primary/20 text-primary hover:bg-primary/30 font-mono text-xs uppercase"
              onClick={handleExecute}
              disabled={executeMutation.isPending}
            >
              {executeMutation.isPending ? "Sending..." : "Execute"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
