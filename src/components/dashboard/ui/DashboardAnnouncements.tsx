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
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm flex flex-col h-[300px]">
      <div className="p-6 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF9F6]">
        <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent-gold" />
          {locale === 'bn' ? "সাম্প্রতিক ঘোষণা" : "Recent Announcements"}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 rounded-xl hover:bg-[#FAF9F6] transition-colors group cursor-pointer border border-transparent hover:border-[#E5E0D8]">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-charcoal text-sm">
                  {locale === 'bn' ? (announcement.title_bn || announcement.title_en) : announcement.title_en}
                </h4>
                <span className="text-xs text-[#6B655C] whitespace-nowrap ml-4">
                  {new Date(announcement.date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-[#6B655C] line-clamp-2">
                {locale === 'bn' ? (announcement.message_bn || announcement.message_en) : announcement.message_en}
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                {locale === 'bn' ? "আরও পড়ুন" : "Read more"} <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
