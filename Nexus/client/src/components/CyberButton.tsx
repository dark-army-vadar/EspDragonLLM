import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "destructive" | "ghost";
  isLoading?: boolean;
  icon?: ReactNode;
}

export function CyberButton({ 
  children, 
  className, 
  variant = "primary", 
  isLoading, 
  icon,
  disabled,
  ...props 
}: CyberButtonProps) {
  const baseClass = variant === "destructive" ? "cyber-button-destructive" : "cyber-button";
  
  return (
    <button 
      className={cn(baseClass, "flex items-center justify-center gap-2", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && icon}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
