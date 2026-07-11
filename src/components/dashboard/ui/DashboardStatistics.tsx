import * as React from "react";
import { Palette, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatisticsProps {
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  locale: string;
}

export function DashboardStatistics({ stats, locale }: DashboardStatisticsProps) {
  const cards = [
    {
      title: locale === 'bn' ? "মোট শিল্পকর্ম" : "Total Submissions",
      value: stats.total,
      icon: <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-current" />,
      bg: "bg-[#FAF9F6] text-charcoal",
      border: "border-[#E5E0D8]",
    },
    {
      title: locale === 'bn' ? "অনুমোদিত" : "Approved",
      value: stats.approved,
      icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-current" />,
      bg: "bg-emerald-50/50 text-emerald-700",
      border: "border-emerald-100",
    },
    {
      title: locale === 'bn' ? "অপেক্ষমান" : "Pending Review",
      value: stats.pending,
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-current" />,
      bg: "bg-amber-50/50 text-amber-700",
      border: "border-amber-100",
    },
    {
      title: locale === 'bn' ? "প্রত্যাখ্যাত" : "Needs Attention",
      value: stats.rejected,
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-current" />,
      bg: "bg-rose-50/50 text-rose-700",
      border: "border-rose-100",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={cn(
            "p-4 sm:p-5 md:p-6 rounded-[20px] md:rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:scale-[0.98] group relative overflow-hidden backdrop-blur-sm h-full",
            card.bg,
            card.border
          )}
        >
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-medium text-[#6B655C] tracking-wide leading-tight">{card.title}</h3>
            <div className="p-1.5 sm:p-2 rounded-full bg-white/60 shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2">
              {card.icon}
            </div>
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-charcoal tracking-tight mt-auto">
            {card.value.toString().padStart(2, '0')}
          </p>
        </div>
      ))}
    </div>
  );
}
