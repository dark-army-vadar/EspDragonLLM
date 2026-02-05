import { useState } from "react";
import { useScripts, useCreateScript, useDeleteScript } from "@/hooks/use-scripts";
import { useExecuteCommand } from "@/hooks/use-commands";
import { useDevices } from "@/hooks/use-devices";
import { FileCode, Play, Trash2, Plus, Code, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertScriptSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Scripts() {
  const { data: scripts, isLoading } = useScripts();
  const deleteScript = useDeleteScript();
  const [selectedScript, setSelectedScript] = useState<number | null>(null);
  const [isRunOpen, setIsRunOpen] = useState(false);

  const activeScript = scripts?.find(s => s.id === selectedScript);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-border pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            PROTOCOLS <span className="text-primary">// DIRECTIVES</span>
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            AUTOMATION SCRIPTS AND SECURITY PROTOCOLS
          </p>
        </div>
        <div className="flex gap-2">
          <CreateScriptDialog />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
        {/* List */}
        <div className="border border-border bg-card/50 rounded-sm flex flex-col h-full overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border font-mono text-xs font-bold uppercase text-muted-foreground">
            Available Protocols
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
               <div className="text-center p-4 text-xs font-mono animate-pulse text-primary">LOADING...</div>
            ) : scripts?.map(script => (
              <div 
                key={script.id}
                onClick={() => setSelectedScript(script.id)}
                className={cn(
                  "p-3 rounded-sm cursor-pointer border transition-all duration-200 group",
                  selectedScript === script.id 
                    ? "bg-primary/10 border-primary/50" 
                    : "bg-background border-border hover:border-primary/30"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={cn(
                      "font-display font-bold text-sm tracking-wide group-hover:text-primary transition-colors",
                      selectedScript === script.id ? "text-primary" : "text-foreground"
                    )}>
                      {script.name}
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded-sm inline-block mt-1">
                      {script.category}
                    </span>
                  </div>
                  <FileCode className={cn(
                    "w-4 h-4 mt-0.5",
                    selectedScript === script.id ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="md:col-span-2 border border-border bg-black/40 rounded-sm flex flex-col h-full relative overflow-hidden">
          {activeScript ? (
            <>
              <div className="p-3 bg-secondary/30 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm font-bold text-foreground">{activeScript.name}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                       if(confirm("Delete this protocol?")) {
                         deleteScript.mutate(activeScript.id);
                         setSelectedScript(null);
                       }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsRunOpen(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-sm hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-3 h-3" /> Execute
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                <div className="text-muted-foreground mb-4 italic text-xs border-l-2 border-primary/30 pl-2">
                  {activeScript.description || "No description provided."}
                </div>
                <pre className="text-green-400 bg-black/50 p-4 rounded-sm border border-white/5 whitespace-pre-wrap">
                  <code>{activeScript.content}</code>
                </pre>
              </div>
              <RunScriptDialog 
                open={isRunOpen} 
                onOpenChange={setIsRunOpen} 
                scriptId={activeScript.id} 
                scriptName={activeScript.name} 
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <FileCode className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-mono text-sm">SELECT A PROTOCOL TO VIEW</p>
            </div>
          )}
          
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
        </div>
      </div>
    </div>
  );
}

function CreateScriptDialog() {
  const [open, setOpen] = useState(false);
  const createScript = useCreateScript();
  
  const form = useForm<z.infer<typeof insertScriptSchema>>({
    resolver: zodResolver(insertScriptSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
      category: "automation"
    },
  });

  const onSubmit = (data: z.infer<typeof insertScriptSchema>) => {
    createScript.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground text-sm font-bold uppercase tracking-wider hover:bg-secondary/80 rounded-sm border border-border transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create Protocol
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border border-border text-foreground font-mono max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-xl">NEW PROTOCOL</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protocol Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background border-input font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="automation">AUTOMATION</SelectItem>
                        <SelectItem value="security">SECURITY</SelectItem>
                        <SelectItem value="maintenance">MAINTENANCE</SelectItem>
                        <SelectItem value="surveillance">SURVEILLANCE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} className="bg-background border-input font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script Code</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-black/50 border-input font-mono min-h-[200px] text-green-400" 
                      placeholder="// Enter executable code here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button 
              type="submit" 
              className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold font-display uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              SAVE TO DATABASE
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RunScriptDialog({ open, onOpenChange, scriptId, scriptName }: { open: boolean, onOpenChange: (o: boolean) => void, scriptId: number, scriptName: string }) {
  const { data: devices } = useDevices();
  const executeCommand = useExecuteCommand();
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const handleRun = () => {
    if (!selectedDevice) return;
    executeCommand.mutate({
      deviceId: parseInt(selectedDevice),
      command: scriptName,
      type: "script"
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border text-foreground font-mono max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-lg">EXECUTE PROTOCOL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">Select target asset for protocol: <span className="text-primary">{scriptName}</span></p>
          
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-muted-foreground">Target Device</label>
            <Select onValueChange={setSelectedDevice}>
              <SelectTrigger className="bg-background border-input w-full">
                <SelectValue placeholder="Select Device..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {devices?.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name} ({d.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button 
            onClick={handleRun}
            disabled={!selectedDevice || executeCommand.isPending}
            className="w-full py-2 bg-destructive/80 hover:bg-destructive text-white font-bold font-display uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Play className="w-4 h-4" /> 
            {executeCommand.isPending ? "INITIATING..." : "INITIATE SEQUENCE"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
