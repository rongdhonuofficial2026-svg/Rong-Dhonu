 
 
import { getCmsContent } from "@/lib/cms/content"
import Image from "next/image"

export async function HomeSponsors({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'sponsors', locale)
  
  if (!content.logos || content.logos.length === 0) return null

  return (
    <section className="py-24 bg-white/5 border-y border-border overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <h3 className="font-sans text-sm tracking-widest uppercase text-muted-foreground mb-12">
          {content.title || "Supported By"}
        </h3>
        
        {/* Simple flex layout for sponsors, could be a marquee in the future */}
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity duration-500">
          {content.logos.map((logo: { name: string, url: string }, i: number) => (
            <div key={i} className="relative w-32 h-16 grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src={logo.url} 
                alt={logo.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function HomeTestimonials({ locale }: { locale: string }) {
  const content = await getCmsContent('homepage', 'testimonials', locale)

  if (!content.items || content.items.length === 0) return null

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="font-serif text-3xl font-bold text-center mb-16">
          {content.title || "What They Say"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {content.items.map((item: any, i: number) => (
            <div key={i} className="bg-muted/30 p-8 rounded-2xl border border-border/50 relative">
              <div className="text-5xl font-serif text-accent/20 absolute top-4 left-6">"</div>
              <p className="text-lg italic leading-relaxed mb-6 mt-4 z-10 relative">
                {locale === 'bn' ? (item.quote_bn || item.quote_en) : item.quote_en}
              </p>
              <div>
                <p className="font-bold">{item.author}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === 'bn' ? (item.role_bn || item.role_en) : item.role_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
