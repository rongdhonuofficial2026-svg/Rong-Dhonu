 
 
 
import { getCmsContent } from "@/lib/cms/content"
import { HomeAboutContent } from "./HomeAboutContent"

export async function HomeAbout({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'about', locale)

  return (
    <section className="py-24 md:py-40 bg-[#FDFBF7] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <HomeAboutContent content={content} locale={locale} />
      </div>
    </section>
  )
}
