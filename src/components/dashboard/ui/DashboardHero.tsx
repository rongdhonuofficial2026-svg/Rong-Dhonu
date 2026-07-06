import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { Upload } from "lucide-react";

interface DashboardHeroProps {
  name: string;
  locale: string;
}

export function DashboardHero({ name, locale }: DashboardHeroProps) {
  return (
    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FAF9F6] to-[#F5F2EB] border border-[#E5E0D8] p-8 md:p-10 shadow-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="relative z-10">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 text-charcoal tracking-tight">
          {locale === 'bn' ? `স্বাগতম, ${name}` : `Welcome back, ${name}.`}
        </h1>
        <p className="text-[#6B655C] text-lg max-w-xl font-light leading-relaxed">
          {locale === 'bn' 
            ? "আপনার শিল্পী ড্যাশবোর্ডে স্বাগতম। আপনার শিল্পকর্ম এবং প্রদর্শনীগুলির আপডেট দেখুন।" 
            : "Your private member lounge. Track your submissions, explore upcoming exhibitions, and manage your artistic journey."}
        </p>
      </div>
      
      <div className="relative z-10 shrink-0">
        <Button asChild size="lg" className="gap-2 bg-charcoal hover:bg-[#2A2A2A] text-white shadow-lg transition-all duration-300 rounded-full px-8">
          <Link href="/dashboard/artworks/new">
            <Upload className="w-4 h-4" />
            {locale === 'bn' ? "নতুন শিল্পকর্ম জমা দিন" : "Submit New Artwork"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
