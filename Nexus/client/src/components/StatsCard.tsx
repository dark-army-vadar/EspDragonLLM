import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card/50 backdrop-blur-sm border border-border p-5 rounded-sm relative overflow-hidden group",
      className
    )}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50 group-hover:border-primary transition-colors"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50 group-hover:border-primary transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50 group-hover:border-primary transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50 group-hover:border-primary transition-colors"></div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-display text-muted-foreground uppercase tracking-widest mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-mono font-bold text-foreground tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={cn(
                "text-xs font-mono",
                trendUp ? "text-green-500" : "text-destructive"
              )}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-secondary/50 rounded-sm text-primary">
          {icon}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none scale-150 text-foreground">
        {icon}
      </div>
    </div>
  );
}
