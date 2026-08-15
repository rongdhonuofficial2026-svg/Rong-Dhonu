import { getCmsContent } from "@/lib/cms/content"
import { HomeNewsletterContent } from "./HomeExtrasContent"

export async function HomeNewsletter({ locale }: { locale: string }) {
  const content = await getCmsContent('home', 'contactCTA', locale)
  if (content?.enabled === false) return null
  return <HomeNewsletterContent locale={locale} content={content} />
}
