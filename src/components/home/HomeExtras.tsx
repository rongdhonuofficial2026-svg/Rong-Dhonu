import { getCmsContent } from "@/lib/cms/content"
import { SectionHeading } from "@/components/museum/section-heading"
import { StatisticsCard } from "@/components/museum/statistics-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Palette, Users, Brush } from "lucide-react"

export async function HomeStatistics({ locale }: { locale: string }) {
  // In a real app, these numbers might come from a DB aggregate query
  // For the public site, we hardcode or pull from CMS if caching
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading title={locale === 'bn' ? "আমাদের প্রভাব" : "Our Impact"} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <StatisticsCard title={locale === 'bn' ? "মোট শিল্পকর্ম" : "Total Artworks"} value="1,248" icon={<Palette />} />
          <StatisticsCard title={locale === 'bn' ? "সক্রিয় শিল্পী" : "Active Artists"} value="342" icon={<Users />} />
          <StatisticsCard title={locale === 'bn' ? "প্রদর্শনীসমূহ" : "Exhibitions"} value="14" icon={<Brush />} />
        </div>
      </div>
    </section>
  )
}

export async function HomeNewsletter({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'contactCTA', locale)
  
  return (
    <section className="py-32 bg-accent text-accent-foreground text-center px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="font-serif text-4xl font-bold">{content.title || "Join Our Artistic Journey"}</h2>
        <p className="text-accent-foreground/80 text-lg">
          {content.description || "Subscribe to our newsletter for updates."}
        </p>
        <form className="flex w-full max-w-md mx-auto items-center space-x-2 mt-8">
          <Input 
            type="email" 
            placeholder={locale === 'bn' ? "আপনার ইমেইল ঠিকানা" : "Your email address"} 
            className="bg-white text-black border-none"
            required
          />
          <Button type="submit" variant="secondary" className="bg-foreground text-background hover:bg-foreground/90">
            {locale === 'bn' ? "সাবস্ক্রাইব" : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  )
}
