import { getCmsContent } from "@/lib/cms/content"
import { SectionHeading } from "@/components/museum/section-heading"
import { HomeStatisticsContent, HomeNewsletterContent } from "./HomeExtrasContent"

export async function HomeStatistics({ locale }: { locale: string }) {
  return (
    <section className="py-32 bg-background overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-border to-transparent" />
      <div className="container mx-auto px-6">
        <SectionHeading title={locale === 'bn' ? "আমাদের প্রভাব" : "Our Impact"} />
        <HomeStatisticsContent locale={locale} />
      </div>
    </section>
  )
}

export async function HomeNewsletter({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'contactCTA', locale)
  
  return (
    <section className="relative py-40 overflow-hidden bg-[#1A1A1A] text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=2000"
          alt="Newsletter Background"
          className="w-full h-full object-cover opacity-40 grayscale blur-[2px]"
        />
      </div>
      <div className="container relative z-20 mx-auto px-6 text-center">
        <HomeNewsletterContent locale={locale} content={content} />
      </div>
    </section>
  )
}
