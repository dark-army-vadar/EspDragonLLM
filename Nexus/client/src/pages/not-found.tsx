import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md p-8 border border-destructive/30 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.1)]">
        <AlertTriangle className="w-24 h-24 text-destructive mb-6 animate-pulse" />
        
        <h1 className="text-6xl font-display font-bold text-destructive mb-2 tracking-widest text-glow">404</h1>
        <h2 className="text-xl font-mono text-white mb-6 uppercase tracking-wider">Signal Lost</h2>
        
        <p className="text-muted-foreground font-mono mb-8 text-sm">
          The requested neural pathway does not exist or has been severed. Return to safe harbor immediately.
        </p>

        <Link href="/">
          <span className="cursor-pointer px-8 py-3 bg-primary/10 border border-primary text-primary font-mono font-bold tracking-widest hover:bg-primary hover:text-black transition-all duration-300">
            RETURN TO DASHBOARD
          </span>
        </Link>
      </div>
    </div>
  );
}
