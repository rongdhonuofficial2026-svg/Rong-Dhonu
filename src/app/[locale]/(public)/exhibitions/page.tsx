import { createClient } from "@/lib/supabase/server"
import { ExhibitionCard } from "@/components/museum/exhibition-card"

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
    .in('status', ['active', 'upcoming', 'completed', 'archived'])
    .order('year', { ascending: false })

  if (error) {
    return <div className="p-8 text-center text-destructive">Failed to load exhibitions.</div>
  }

  const active = exhibitions?.filter(e => e.status === 'active' || e.status === 'upcoming') || []
  const past = exhibitions?.filter(e => e.status === 'completed' || e.status === 'archived') || []

  return (
    <main className="min-h-screen pb-32">
      {/* Editorial Header */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#F5F5F0]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] transform rotate-12 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {locale === 'bn' ? 'প্রদর্শনী আর্কাইভ' : 'Exhibitions Archive'}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 font-light max-w-2xl leading-relaxed">
              {locale === 'bn' 
                ? 'আমাদের বর্তমান এবং অতীতের সমস্ত প্রদর্শনীর একটি আর্কাইভ।' 
                : 'Explore the legacy of our annual fine arts exhibitions, showcasing generations of artistic brilliance.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl space-y-32 -mt-10 relative z-20">
        
        {active.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-end gap-6 border-b border-border/50 pb-6">
              <h2 className="font-serif text-3xl font-bold">{locale === 'bn' ? 'চলমান ও আসন্ন' : 'Current & Upcoming'}</h2>
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {active.length} {locale === 'bn' ? 'টি প্রদর্শনী' : 'Exhibitions'}
              </span>
            </div>
            
            <div className="flex flex-col gap-16">
              {active.map(ex => (
                <ExhibitionCard 
                  key={ex.id}
                  id={ex.id}
                  title={locale === 'bn' && ex.title_bn ? ex.title_bn : ex.title_en}
                  status={ex.status}
                  startDate={new Date(ex.start_date)}
                  endDate={new Date(ex.end_date)}
                  venue={locale === 'bn' && ex.venue_bn ? ex.venue_bn : ex.venue_en}
                  coverImageUrl={ex.hero_image_url}
                  className="shadow-2xl border-none"
                />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-end gap-6 border-b border-border/50 pb-6">
              <h2 className="font-serif text-3xl font-bold">{locale === 'bn' ? 'অতীতের প্রদর্শনী' : 'Past Exhibitions'}</h2>
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {past.length} {locale === 'bn' ? 'টি প্রদর্শনী' : 'Exhibitions'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {past.map(ex => (
                <ExhibitionCard 
                  key={ex.id}
                  id={ex.id}
                  title={locale === 'bn' && ex.title_bn ? ex.title_bn : ex.title_en}
                  status={ex.status}
                  startDate={new Date(ex.start_date)}
                  endDate={new Date(ex.end_date)}
                  venue={locale === 'bn' && ex.venue_bn ? ex.venue_bn : ex.venue_en}
                  coverImageUrl={ex.hero_image_url}
                  className="flex-col !bg-transparent group"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
