 
 
 
import { getCmsContent } from "@/lib/cms/content"
import { HomeAboutContent } from "./HomeAboutContent"

export async function HomeAbout({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'about', locale)

  return (
    <section className="py-32 bg-background container mx-auto px-6 overflow-hidden">
      <HomeAboutContent content={content} />
    </section>
  )
}
