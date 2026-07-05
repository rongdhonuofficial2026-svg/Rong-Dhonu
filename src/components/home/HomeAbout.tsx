 
 
 
import { getCmsContent } from "@/lib/cms/content"
import { SectionHeading } from "@/components/museum/section-heading"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"

export async function HomeAbout({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'about', locale)

  return (
    <section className="py-24 bg-background container mx-auto px-6">
      <SectionHeading title={content.title || "About Rongdhono"} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16 max-w-6xl mx-auto items-center">
        <div className="space-y-8">
          <div>
            <h3 className="font-serif text-2xl font-bold text-accent mb-4">Our Mission</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {content.mission}
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-accent mb-4">Our Vision</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {content.vision}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/about">Discover Our History</Link>
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-accent/10 translate-x-4 translate-y-4 rounded-xl" />
          <div className="relative bg-card p-10 rounded-xl border border-border shadow-sm">
            <h3 className="font-serif text-2xl font-bold mb-4">A Brief History</h3>
            <p className="text-muted-foreground leading-relaxed italic border-l-4 border-accent pl-4">
              "{content.history}"
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
