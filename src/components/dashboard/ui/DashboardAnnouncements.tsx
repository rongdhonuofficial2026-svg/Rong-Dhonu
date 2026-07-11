import { Bell, ArrowRight } from "lucide-react";
import { DashboardEmptyState } from "./DashboardEmptyState";

interface Announcement {
  id: string;
  title_en: string;
  title_bn: string | null;
  message_en: string;
  message_bn: string | null;
  date: string;
}

interface DashboardAnnouncementsProps {
  announcements: Announcement[];
  locale: string;
}

export function DashboardAnnouncements({ announcements, locale }: DashboardAnnouncementsProps) {
  if (!announcements || announcements.length === 0) {
    return (
      <DashboardEmptyState
        title={locale === 'bn' ? "কোনো নতুন ঘোষণা নেই" : "No New Announcements"}
        description={locale === 'bn' ? "মুহূর্তের জন্য সবকিছু শান্ত। নতুন আপডেটের জন্য পরে আবার চেক করুন।" : "All quiet for now. Check back later for updates on exhibitions and events."}
        icon={<Bell className="w-8 h-8 opacity-40" />}
        className="h-[300px]"
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl md:rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm flex flex-col h-[350px] md:h-[300px] transition-all duration-300">
      <div className="p-5 sm:p-6 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF9F6]">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal flex items-center gap-2.5">
          <div className="p-1.5 bg-white rounded-full shadow-sm border border-[#E5E0D8]">
            <Bell className="w-4 h-4 text-accent-gold" />
          </div>
          {locale === 'bn' ? "সাম্প্রতিক ঘোষণা" : "Recent Announcements"}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 scrollbar-thin scrollbar-thumb-[#E5E0D8] scrollbar-track-transparent">
        <div className="space-y-1.5 sm:space-y-1">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 sm:p-5 rounded-2xl hover:bg-[#FAF9F6] active:bg-[#F5F2EB] active:scale-[0.99] transition-all duration-200 group cursor-pointer border border-transparent hover:border-[#E5E0D8] hover:shadow-sm">
              <div className="flex justify-between items-start mb-1.5 sm:mb-1">
                <h4 className="font-medium text-charcoal text-sm sm:text-base pr-4 leading-snug">
                  {locale === 'bn' ? (announcement.title_bn || announcement.title_en) : announcement.title_en}
                </h4>
                <span className="text-xs font-medium text-[#6B655C]/70 whitespace-nowrap shrink-0 mt-0.5">
                  {new Date(announcement.date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-[#6B655C] leading-relaxed line-clamp-2">
                {locale === 'bn' ? (announcement.message_bn || announcement.message_en) : announcement.message_en}
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-accent-gold sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-y-1 sm:group-hover:translate-y-0 duration-300">
                {locale === 'bn' ? "আরও পড়ুন" : "Read more"} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
