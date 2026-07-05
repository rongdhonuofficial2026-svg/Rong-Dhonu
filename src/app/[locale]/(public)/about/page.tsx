import { getCmsContent } from "@/lib/cms/content"
import { SectionHeading } from "@/components/museum/section-heading"
import { generateDynamicMetadata } from "@/lib/seo"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const content = await getCmsContent('homepage', 'about', locale)
  return generateDynamicMetadata({
    title: content.title || "About Us",
    description: content.mission || "Learn more about the Rongdhono artists' collective.",
    url: '/about',
    locale
  })
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const content = await getCmsContent('homepage', 'about', locale)

  return (
    <main className="flex flex-col w-full min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <SectionHeading title={content.title || "About Rongdhono"} />
        
        <div className="mt-16 space-y-16">
          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-accent">Our Mission</h2>
            <p className="text-xl leading-relaxed text-muted-foreground">
              {content.mission}
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-accent">Our Vision</h2>
            <p className="text-xl leading-relaxed text-muted-foreground">
              {content.vision}
            </p>
          </section>

          <section className="space-y-6 bg-muted/20 p-10 rounded-2xl border border-border">
            <h2 className="font-serif text-3xl font-bold">History & Legacy</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {content.history}
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
