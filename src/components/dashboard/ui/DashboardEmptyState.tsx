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
    <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 text-center bg-gradient-to-b from-[#FAF9F6]/50 to-white rounded-3xl md:rounded-2xl border border-[#E5E0D8]/60 shadow-sm backdrop-blur-sm", className)}>
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FAF9F6] to-[#F5F2EB] rounded-full flex items-center justify-center mb-6 sm:mb-8 text-accent-gold shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E0D8]/40 ring-4 ring-[#FAF9F6]">
        {icon || <Palette className="w-10 h-10 sm:w-12 sm:h-12 opacity-70 drop-shadow-sm" />}
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-3 sm:mb-4 tracking-tight">{title}</h3>
      <p className="text-[#6B655C] max-w-md mx-auto text-base sm:text-lg font-light leading-relaxed">
        {description}
      </p>
    </div>
  );
}
