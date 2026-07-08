import { getCmsContent } from "@/lib/cms/content"
import { HomeAboutContent } from "./HomeAboutContent"

export async function HomeAbout({ locale, stats }: { locale: string, stats?: any }) {
  const content = await getCmsContent('homepage', 'about', locale)
  return <HomeAboutContent content={content} locale={locale} stats={stats} />
}
