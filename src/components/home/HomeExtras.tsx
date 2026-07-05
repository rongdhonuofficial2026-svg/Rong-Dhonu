import { getCmsContent } from "@/lib/cms/content"
import { HomeStatisticsContent, HomeNewsletterContent } from "./HomeExtrasContent"
import Image from "next/image"

export async function HomeStatistics({ locale, stats }: { locale: string, stats?: any }) {
  return (
    <section className="py-24 bg-[#1C1C1E] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <HomeStatisticsContent locale={locale} stats={stats} />
      </div>
    </section>
  )
}

export async function HomeNewsletter({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'contactCTA', locale)
  
  return (
    <section className="relative py-32 md:py-48 overflow-hidden bg-[#111111] text-[#FDFBF7]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-black/60 to-[#111111] z-10" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-overlay z-10 pointer-events-none" />
        <Image 
          src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=2000"
          alt="Newsletter Background"
          fill
          className="object-cover opacity-30 grayscale blur-[4px]"
        />
      </div>
      <div className="container relative z-20 mx-auto px-6 text-center">
        <HomeNewsletterContent locale={locale} content={content} />
      </div>
    </section>
  )
}
