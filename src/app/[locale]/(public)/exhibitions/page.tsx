import { createClient } from "@/lib/supabase/server"
import { ExhibitionCard } from "@/components/museum/exhibition-card"
import { PremiumImage } from "@/components/ui/PremiumImage"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'bn' ? 'প্রদর্শনী সমূহ | রঙধনু' : 'Exhibitions | Rongdhono',
    description: locale === 'bn' ? 'রঙধনু বার্ষিক চারুকলা প্রদর্শনীর আর্কাইভ।' : 'Archive of Rongdhono Annual Fine Arts Exhibitions.'
  }
}

export default async function ExhibitionsArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('*')
    .in('status', ['upcoming', 'ongoing', 'archived'])
    .neq('is_deleted', true)
    .order('exhibition_start', { ascending: false })

  if (error) {
    return <div className="p-8 text-center text-destructive flex items-center justify-center min-h-screen">Failed to load exhibitions.</div>
  }

  const active = exhibitions?.filter(e => e.status === 'upcoming' || e.status === 'ongoing') || []
  const past = exhibitions?.filter(e => e.status === 'archived') || []

  // Group past by year
  const pastByYear = past.reduce((acc, ex) => {
    const year = ex.exhibition_start ? new Date(ex.exhibition_start).getFullYear() : 'Unknown'
    if (!acc[year]) acc[year] = []
    acc[year].push(ex)
    return acc
  }, {} as Record<string, typeof past>)

  const sortedYears = Object.keys(pastByYear).sort((a, b) => {
    if (a === 'Unknown') return 1
    if (b === 'Unknown') return -1
    return Number(b) - Number(a)
  })

  return (
    <main className="min-h-screen pb-32 bg-[#F5F5F0]">
      
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Cinematic Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 w-full h-full">
          <PremiumImage 
            src="/images/placeholders/exhibition.webp"
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt="Exhibitions Archive"
            fill
            priority
            className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>
        
        {/* Deep gradient for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F5F5F0] via-black/40 to-transparent" />
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-6 mt-20">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-medium tracking-tight drop-shadow-2xl">
            {locale === 'bn' ? 'প্রদর্শনী আর্কাইভ' : 'Exhibitions'}
          </h1>
          <div className="w-16 h-[1px] bg-white/50 mx-auto" />
          <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            {locale === 'bn' 
              ? 'আমাদের বর্তমান এবং অতীতের সমস্ত প্রদর্শনীর একটি আর্কাইভ।' 
              : 'Explore the legacy of our annual fine arts exhibitions, showcasing generations of artistic brilliance.'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl space-y-32 relative z-20 mt-24">
        
        {active.length > 0 && (
          <section className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/10 pb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                {locale === 'bn' ? 'চলমান ও আসন্ন' : 'Upcoming & Ongoing'}
              </h2>
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {active.length} {locale === 'bn' ? 'টি প্রদর্শনী' : 'Exhibitions'}
              </span>
            </div>
            
            <div className="flex flex-col gap-24">
              {active.map(ex => (
                <ExhibitionCard 
                  key={ex.id}
                  id={ex.id}
                  title={locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en}
                  status={ex.status}
                  startDate={ex.exhibition_start ? new Date(ex.exhibition_start) : null}
                  endDate={ex.exhibition_end ? new Date(ex.exhibition_end) : null}
                  venue={locale === 'bn' && ex.venue_bn ? ex.venue_bn : ex.venue_en}
                  coverImageUrl={ex.hero_image_url}
                />
              ))}
            </div>
          </section>
        )}

        {sortedYears.length > 0 && (
          <section className="space-y-16 pt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/10 pb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                {locale === 'bn' ? 'অতীতের প্রদর্শনী' : 'Past Exhibitions'}
              </h2>
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {past.length} {locale === 'bn' ? 'টি প্রদর্শনী' : 'Exhibitions'}
              </span>
            </div>
            
            <div className="space-y-32">
              {sortedYears.map(year => (
                <div key={year} className="space-y-12">
                  <div className="flex items-center gap-6">
                    <h3 className="font-serif text-3xl text-muted-foreground">{year}</h3>
                    <div className="h-[1px] flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-1 gap-24">
                    {pastByYear[year].map((ex: any) => (
                      <ExhibitionCard 
                        key={ex.id}
                        id={ex.id}
                        title={locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en}
                        status={ex.status}
                        startDate={ex.exhibition_start ? new Date(ex.exhibition_start) : null}
                        endDate={ex.exhibition_end ? new Date(ex.exhibition_end) : null}
                        venue={locale === 'bn' && ex.venue_bn ? ex.venue_bn : ex.venue_en}
                        coverImageUrl={ex.hero_image_url}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {active.length === 0 && past.length === 0 && (
          <div className="text-center py-32 space-y-6">
            <h2 className="font-serif text-3xl text-muted-foreground">No exhibitions available yet.</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our curators are currently preparing our upcoming events. Please check back later.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
