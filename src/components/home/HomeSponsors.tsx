import { getCmsContent } from "@/lib/cms/content"
import { HomeSponsorsContent, HomeTestimonialsContent } from "./HomeSponsorsContent"

export async function HomeSponsors({ locale }: { locale: string }) {
  const content = await getCmsContent('home', 'sponsors', locale)
  return <HomeSponsorsContent locale={locale} content={content} />
}

export async function HomeTestimonials({ locale }: { locale: string }) {
  const content = await getCmsContent('home', 'testimonials', locale)
  return <HomeTestimonialsContent locale={locale} content={content} />
}
