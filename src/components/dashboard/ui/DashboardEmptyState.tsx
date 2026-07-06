import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardEmptyState({ 
  title, 
  description, 
  icon,
  className 
}: DashboardEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-[#E5E0D8] border-dashed", className)}>
      <div className="w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mb-6 text-accent-gold shadow-inner border border-[#E5E0D8]">
        {icon || <Palette className="w-8 h-8 opacity-80" />}
      </div>
      <h3 className="font-serif text-xl font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-[#6B655C] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
