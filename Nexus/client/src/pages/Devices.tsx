import { useState } from "react";
import { useDevices, useCreateDevice, useDeleteDevice } from "@/hooks/use-devices";
import { useExecuteCommand } from "@/hooks/use-commands";
import { StatusBadge } from "@/components/StatusBadge";
import { Smartphone, Plus, Trash2, Terminal, Power, Database, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeviceSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Devices() {
  const { data: devices, isLoading } = useDevices();
  const deleteDevice = useDeleteDevice();
  const executeCommand = useExecuteCommand();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDevices = devices?.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTerminal = (id: number) => {
    // Quick action: Launch shell
    const cmd = prompt("Enter shell command for device " + id + ":", "ls -la");
    if (cmd) {
      executeCommand.mutate({
        deviceId: id,
        command: cmd,
        type: "shell"
      });
    }
  };

  const handleReboot = (id: number) => {
    if(confirm("Confirm REBOOT sequence for device " + id + "?")) {
      executeCommand.mutate({
        deviceId: id,
        command: "reboot",
        type: "shell"
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            FIELD ASSETS <span className="text-primary">// MANIFEST</span>
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            MANAGE DEPLOYED UNITS AND EMULATORS
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="SEARCH SERIAL/ID..." 
              className="pl-8 pr-4 py-2 bg-background border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-primary w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateDeviceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-mono text-primary animate-pulse">
          INITIALIZING ASSET FEED...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDevices?.map((device) => (
            <div key={device.id} className="group bg-card border border-border rounded-sm overflow-hidden hover:border-primary/50 transition-all duration-300 relative">
              {/* Card Header */}
              <div className="p-4 bg-secondary/30 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-sm text-primary">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-lg tracking-wide">{device.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground uppercase">{device.serial}</p>
                  </div>
                </div>
                <StatusBadge status={device.status} />
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase mb-1">IP Address</span>
                    <span className="text-foreground">{device.ipAddress || "UNKNOWN"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase mb-1">Platform</span>
                    <span className="text-foreground uppercase">{device.platform}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase mb-1">Battery</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${device.batteryLevel}%` }}
                        />
                      </div>
                      <span>{device.batteryLevel}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase mb-1">Last Seen</span>
                    <span className="text-foreground">
                      {device.lastSeen ? format(new Date(device.lastSeen), "HH:mm") : "-"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <button 
                    onClick={() => handleTerminal(device.id)}
                    className="flex-1 py-2 bg-secondary/50 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50 rounded-sm text-xs font-mono flex items-center justify-center gap-2 transition-all"
                    title="Open Shell"
                  >
                    <Terminal className="w-3 h-3" /> SHELL
                  </button>
                  <button 
                    onClick={() => handleReboot(device.id)}
                    className="flex-1 py-2 bg-secondary/50 hover:bg-amber-500/20 hover:text-amber-500 border border-transparent hover:border-amber-500/50 rounded-sm text-xs font-mono flex items-center justify-center gap-2 transition-all"
                    title="Reboot"
                  >
                    <Power className="w-3 h-3" /> REBOOT
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm("Wipe device data? This cannot be undone.")) deleteDevice.mutate(device.id);
                    }}
                    className="flex-1 py-2 bg-secondary/50 hover:bg-destructive/20 hover:text-destructive border border-transparent hover:border-destructive/50 rounded-sm text-xs font-mono flex items-center justify-center gap-2 transition-all"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3 h-3" /> WIPE
                  </button>
                </div>
              </div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-2 h-2 bg-primary"></div>
              </div>
            </div>
          ))}
          
          {filteredDevices?.length === 0 && (
             <div className="col-span-full py-12 text-center border border-dashed border-border rounded-sm text-muted-foreground font-mono">
               NO ASSETS FOUND MATCHING CRITERIA
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateDeviceDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const createDevice = useCreateDevice();
  const form = useForm<z.infer<typeof insertDeviceSchema>>({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      name: "",
      serial: "",
      platform: "android",
      ipAddress: "",
      status: "offline",
      batteryLevel: 100
    },
  });

  const onSubmit = (data: z.infer<typeof insertDeviceSchema>) => {
    createDevice.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-primary/90 rounded-sm transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Deploy Asset
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border border-border text-foreground font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-xl">NEW ASSET DEPLOYMENT</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Designation (Name)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-input font-mono" placeholder="e.g. PIXEL-OPERATIVE-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-input font-mono" placeholder="Unique HWID" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="android">ANDROID</SelectItem>
                        <SelectItem value="ios">IOS</SelectItem>
                        <SelectItem value="linux">LINUX EMBEDDED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background border-input font-mono" placeholder="192.168.x.x" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold font-display uppercase tracking-widest hover:bg-primary/90 transition-colors"
              disabled={createDevice.isPending}
            >
              {createDevice.isPending ? "INITIALIZING..." : "CONFIRM DEPLOYMENT"}
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
