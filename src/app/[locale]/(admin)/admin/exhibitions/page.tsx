import { createClient } from "@/lib/supabase/server"
import { Link } from "@/lib/i18n/routing"
import { Plus, Edit, Calendar, MapPin, Eye, ArrowRight, Paintbrush } from "lucide-react"
import { ExhibitionActions } from "@/components/admin/ExhibitionActions"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"
import Image from "next/image"

export default async function ExhibitionsManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('*')
    .order('exhibition_start', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading exhibitions: {error.message}</div>
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'draft': return 'bg-white/10 text-muted-foreground border-white/20';
      case 'archived': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-white/10 text-white border-white/20';
    }
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Module Hero */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/exhibitions_hero.png" 
            alt="Exhibition Hall" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-2xl text-white">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 leading-tight text-shadow-elegant">
              Curation <span className="text-gradient-gold">Timeline</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Architect and schedule the museum's exhibitions. Oversee active galleries, plan upcoming showcases, and preserve the archives.
            </p>
          </div>
          <PremiumButton variant="primary" asChild leftIcon={<Plus className="w-4 h-4" />}>
            <Link href="/admin/exhibitions/new">New Exhibition</Link>
          </PremiumButton>
        </div>
      </section>

      {/* Timeline Layout */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="font-serif text-2xl tracking-tight">Exhibition Roster</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Active</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Upcoming</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {!exhibitions || exhibitions.length === 0 ? (
            <div className="col-span-full p-20 text-center">
              <GlassPanel intensity="light" className="inline-flex flex-col items-center justify-center p-12 max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6">
                  <Paintbrush className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-serif text-2xl mb-2">Awaiting Curation</h3>
                <p className="text-muted-foreground mb-8">The exhibition halls are currently empty. Schedule your first showcase.</p>
                <PremiumButton asChild variant="primary">
                  <Link href="/admin/exhibitions/new">Create Exhibition</Link>
                </PremiumButton>
              </GlassPanel>
            </div>
          ) : (
            exhibitions.map((ex) => (
              <LuxuryCard 
                key={ex.id} 
                padding="none" 
                className={`overflow-hidden transition-all duration-700 ${ex.status === 'archived' ? 'opacity-70 grayscale-[30%]' : ''}`}
              >
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Image Column */}
                  <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden group">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: ex.hero_image_url ? `url(${ex.hero_image_url})` : 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${getStatusColor(ex.status)}`}>
                        {ex.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Column */}
                  <div className="sm:w-3/5 p-6 flex flex-col">
                    <div className="mb-2">
                      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">
                        {ex.exhibition_start ? new Date(ex.exhibition_start).getFullYear() : 'TBD'} Season
                      </p>
                      <h3 className="font-serif text-2xl leading-tight mb-2 group-hover:text-accent transition-colors">
                        {ex.theme_en}
                      </h3>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground/70" />
                        <span>
                          {ex.exhibition_start ? new Date(ex.exhibition_start).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBD'} 
                          {ex.exhibition_end ? ` — ${new Date(ex.exhibition_end).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-muted-foreground/70" />
                        <span>{ex.venue_en || 'Virtual Gallery'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/40">
                      <PremiumButton variant="ghost" size="sm" className="flex-1" leftIcon={<Edit className="w-4 h-4"/>} asChild>
                        <Link href={`/admin/exhibitions/${ex.id}`}>Edit</Link>
                      </PremiumButton>
                      <PremiumButton variant="ghost" size="sm" className="flex-1" leftIcon={<Eye className="w-4 h-4"/>} asChild>
                        <Link href={`/exhibitions/${ex.id}`} target="_blank">Preview</Link>
                      </PremiumButton>
                      <div className="pl-2 border-l border-border/40">
                        <ExhibitionActions id={ex.id} locale={locale} />
                      </div>
                    </div>
                  </div>
                </div>
              </LuxuryCard>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
