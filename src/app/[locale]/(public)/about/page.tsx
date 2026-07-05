import { getCmsContent } from "@/lib/cms/content"
import { generateDynamicMetadata } from "@/lib/seo"
import { AboutContent } from "./AboutContent"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const content = await getCmsContent('homepage', 'about', locale)
  return generateDynamicMetadata({
    title: content.title || "About Us",
    description: content.mission || "Learn more about the Rongdhono artists' collective.",
    url: '/about',
    locale
  })
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const content = await getCmsContent('homepage', 'about', locale)

  return (
    <main className="flex flex-col w-full min-h-screen bg-background">
      <AboutContent content={content} locale={locale} />
    </main>
  )
}
