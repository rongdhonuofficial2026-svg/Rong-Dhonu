import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { Calendar, ChevronRight } from "lucide-react";
import { DashboardEmptyState } from "./DashboardEmptyState";

interface Exhibition {
  id: string;
  title_en: string;
  title_bn: string | null;
  submission_deadline: string;
}

interface DashboardTimelineProps {
  exhibition: Exhibition | null;
  locale: string;
}

export function DashboardTimeline({ exhibition, locale }: DashboardTimelineProps) {
  if (!exhibition) {
    return (
      <DashboardEmptyState
        title={locale === 'bn' ? "কোনো সক্রিয় প্রদর্শনী নেই" : "No Active Exhibition"}
        description={locale === 'bn' ? "আমরা বর্তমানে পরবর্তী প্রদর্শনীর জন্য প্রস্তুতি নিচ্ছি। চোখ রাখুন।" : "We are curating the next grand exhibition. Stay tuned for announcements."}
      />
    );
  }

  const title = locale === 'bn' ? (exhibition.title_bn || exhibition.title_en) : exhibition.title_en;
  const deadline = new Date(exhibition.submission_deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-white rounded-3xl md:rounded-2xl border border-[#E5E0D8] p-6 md:p-8 shadow-sm relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-accent-gold" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3 md:mb-2">
            <span className="bg-[#FAF9F6] text-[#6B655C] text-[11px] sm:text-xs font-semibold px-3 py-1.5 sm:py-1 rounded-full uppercase tracking-wider border border-[#E5E0D8]">
              {locale === 'bn' ? "বর্তমান প্রদর্শনী" : "Current Exhibition"}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-3 md:mb-2 tracking-tight">{title}</h2>
          <div className="flex items-center text-[#6B655C] text-sm sm:text-base">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 opacity-70" />
            <span>
              {locale === 'bn' ? "জমা দেওয়ার শেষ তারিখ: " : "Submission Deadline: "}
              <strong className="text-charcoal font-medium">
                {deadline.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </strong>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end w-full md:w-auto gap-4 shrink-0">
          <div className="bg-[#FAF9F6] md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-[#E5E0D8]/60 flex justify-between md:block items-center">
            <span className="text-sm font-medium text-[#6B655C] md:hidden">{locale === 'bn' ? "বাকি সময়:" : "Time left:"}</span>
            {daysLeft > 0 ? (
              <div className="text-right flex items-baseline md:block">
                <span className="font-serif text-3xl font-bold text-accent-gold">{daysLeft}</span>
                <span className="text-sm text-[#6B655C] ml-2 font-medium">{locale === 'bn' ? "দিন বাকি" : "days left"}</span>
              </div>
            ) : (
              <div className="text-right">
                <span className="font-serif text-xl font-bold text-rose-600">{locale === 'bn' ? "সময় শেষ" : "Closed"}</span>
              </div>
            )}
          </div>
          <Button asChild variant="outline" className="w-full md:w-auto min-h-[44px] rounded-full border-[#E5E0D8] text-charcoal hover:bg-[#FAF9F6] active:scale-95 transition-all duration-300">
            <Link href="/dashboard/artworks" className="flex items-center justify-center">
              {locale === 'bn' ? "আমার শিল্পকর্মগুলি দেখুন" : "View My Artworks"}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
