import { getCmsContent } from "@/lib/cms/content"
import { HeroBanner } from "@/components/museum/hero-banner"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"

export async function HomeHero({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'hero', locale)
  
  return (
    <section className="w-full">
      <HeroBanner
        title={content.title || "Where Art Meets Soul"}
        subtitle={content.subtitle}
        imageUrl={content.imageUrl || "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000"}
        overlayOpacity="dark"
        primaryAction={
          content.ctaPrimary ? (
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
              <Link href="/gallery">{content.ctaPrimary}</Link>
            </Button>
          ) : null
        }
        secondaryAction={
          content.ctaSecondary ? (
            <Button asChild variant="outline" size="lg" className="bg-white/10 text-white hover:bg-white/20 border-white/30 px-8 py-6 text-lg">
              <Link href="/about">{content.ctaSecondary}</Link>
            </Button>
          ) : null
        }
      />
    </section>
  )
}
