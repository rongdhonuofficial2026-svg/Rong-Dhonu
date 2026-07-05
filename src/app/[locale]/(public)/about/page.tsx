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
      {/* Editorial Header */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#F5F5F0]" />
        
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {content.title || (locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About Rongdhono')}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 font-light max-w-2xl leading-relaxed">
              {locale === 'bn' 
                ? 'শিল্প ও শিল্পীর সেতুবন্ধন' 
                : 'A legacy of fine arts, nurturing creativity and preserving heritage since 2010.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl pt-24 pb-0">
        <AboutContent content={content} locale={locale} />
      </div>
    </main>
  )
}
