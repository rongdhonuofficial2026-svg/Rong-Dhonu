 
 
import { getCmsContent } from "@/lib/cms/content"
import { HomeSponsorsContent, HomeTestimonialsContent } from "./HomeSponsorsContent"

export async function HomeSponsors({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'sponsors', locale)
  
  return (
    <section className="py-24 bg-[#FDFBF7] border-y border-black/5 overflow-hidden">
      <HomeSponsorsContent locale={locale} content={content} />
    </section>
  )
}

export async function HomeTestimonials({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'testimonials', locale)

  return (
    <section className="py-32 md:py-48 bg-[#FDFBF7] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#E6E2D3]/40 to-transparent blur-3xl rounded-bl-full pointer-events-none" />
      <HomeTestimonialsContent locale={locale} content={content} />
    </section>
  )
}
