import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  delay?: number;
}

export function CyberCard({ children, className, title, icon, delay = 0 }: CyberCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn("cyber-card p-6 flex flex-col h-full bg-card/80 backdrop-blur-sm", className)}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4 border-b border-border/50 pb-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title && <h3 className="text-lg font-bold tracking-widest text-primary/90">{title}</h3>}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Decorative corner lines handled by CSS class .cyber-card */}
    </motion.div>
  );
}
