import { Link, useLocation } from "wouter";
import { Shield, Smartphone, Terminal, Activity, FileCode, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Field Assets", href: "/devices", icon: Smartphone },
  { name: "Agent", href: "/agent", icon: Shield },
  { name: "Protocols", href: "/scripts", icon: FileCode },
  { name: "Operation Logs", href: "/commands", icon: Terminal },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm z-40 fixed left-0 top-0">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Shield className="h-6 w-6 text-primary mr-2" />
        <span className="text-lg font-display tracking-wider font-bold text-foreground">
          AGENCY<span className="text-primary">NET</span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="mb-6 px-3">
          <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">
            Main Interface
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-sm cursor-pointer transition-all duration-200 group",
                    isActive 
                      ? "bg-primary/10 text-primary border-l-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
                  )}>
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4">
          <div className="rounded-sm border border-border bg-black/20 p-4">
            <div className="flex items-center mb-2">
              <Radio className="h-4 w-4 text-accent animate-pulse mr-2" />
              <span className="text-xs font-display text-accent tracking-widest">SYSTEM STATUS</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>UPLINK</span>
                <span className="text-green-500">STABLE</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>ENCRYPTION</span>
                <span className="text-primary">AES-256</span>
              </div>
              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
