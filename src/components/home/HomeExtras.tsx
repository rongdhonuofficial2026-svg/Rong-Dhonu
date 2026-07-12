import { getCmsContent } from "@/lib/cms/content"
import { HomeNewsletterContent } from "./HomeExtrasContent"

export async function HomeNewsletter({ locale }: { locale: string }) {
  const content = await getCmsContent('home', 'contactCTA', locale)
  return <HomeNewsletterContent locale={locale} content={content} />
}
