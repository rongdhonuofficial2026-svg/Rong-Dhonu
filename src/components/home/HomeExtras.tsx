import { getCmsContent } from "@/lib/cms/content"
import { HomeNewsletterContent } from "./HomeExtrasContent"
import Image from "next/image"

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
