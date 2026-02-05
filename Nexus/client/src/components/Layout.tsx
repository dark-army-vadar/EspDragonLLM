import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Terminal, Bot, FileText, Activity, ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "DASHBOARD", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "COMMAND CENTER", path: "/commands", icon: <Terminal className="w-5 h-5" /> },
  { label: "AGENT BUILDER", path: "/builder", icon: <Bot className="w-5 h-5" /> },
  { label: "LOG ANALYSIS", path: "/logs", icon: <FileText className="w-5 h-5" /> },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-ui text-foreground">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-black/40 backdrop-blur-md flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
          <div>
            <h1 className="text-xl font-bold text-primary tracking-widest font-display">NEXUS</h1>
            <p className="text-xs text-muted-foreground font-mono tracking-wider">C2 CONTROL SYSTEM</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} href={item.path} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded border border-transparent transition-all duration-200 group",
              location === item.path 
                ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,65,0.1)]" 
                : "hover:bg-accent hover:border-accent hover:text-white text-muted-foreground"
            )}>
              <span className={cn(
                "transition-colors",
                location === item.path ? "text-primary" : "group-hover:text-white"
              )}>
                {item.icon}
              </span>
              <span className="font-mono font-bold tracking-wider">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border bg-black/20">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            <span>SYSTEM ONLINE</span>
            <span className="ml-auto">v2.0.4</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-border bg-black/20 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-mono text-primary/70">
             <span className="text-muted-foreground">&gt;</span> root@nexus-c2 <span className="text-muted-foreground">:~</span> {location}
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 border border-primary/30 rounded bg-primary/5 text-xs font-mono text-primary">
                <Cpu className="w-3 h-3" />
                <span>CORE: STABLE</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
