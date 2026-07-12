import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/lib/i18n/routing"
import Image from "next/image"
import { ExhibitionCard } from "@/components/museum/exhibition-card"
import { CatalogDownloadButton } from "@/components/public/catalogs/CatalogDownloadButton"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: exhibition } = await supabase.from('exhibitions').select('theme_en, theme_bn, description_en, description_bn, curatorial_statement_en, curatorial_statement_bn, hero_image_url').eq('id', id).maybeSingle()
  
  if (!exhibition) return {}

  const title = locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en
  let description = locale === 'bn' && exhibition.description_bn ? exhibition.description_bn : exhibition.description_en
  if (!description) {
    description = locale === 'bn' && exhibition.curatorial_statement_bn ? exhibition.curatorial_statement_bn : exhibition.curatorial_statement_en
  }

  return {
    title: `${title} | Rongdhonu`,
    description,
    openGraph: {
      title,
      description,
      images: exhibition.hero_image_url ? [exhibition.hero_image_url] : []
    }
  }
}

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: initialExhibition, error } = await supabase
    .from('exhibitions')
    .select(`
      *,
      events(*),
      committee_members(*, profiles(full_name_en, full_name_bn, avatar_url))
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !initialExhibition || initialExhibition.is_deleted) return notFound()

  let exhibition = initialExhibition

  // Lazy sync the exhibition lifecycle
  const { syncExhibitionLifecycle } = await import('@/lib/exhibition-lifecycle')
  const synced = await syncExhibitionLifecycle(exhibition, supabase)
  if (synced) exhibition = synced

  // Safely fetch ONLY approved artworks without forcing an inner join on the parent exhibition
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      id, title_en, title_bn, main_image_url, category, medium_en,
      profiles!artist_id(id, full_name_en, full_name_bn, avatar_url)
    `)
    .eq('exhibition_id', id)
    .eq('status', 'approved')
    
  // Attach artworks for the render pipeline
  exhibition.artworks = artworks || []

  // Fetch the published catalog for this exhibition
  const { data: catalog } = await supabase
    .from('catalogs')
    .select('id, title_en, title_bn, pdf_url, total_downloads')
    .eq('exhibition_id', id)
    .eq('status', 'published')
    .maybeSingle()

  const title = locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en
  const curatorialStmt = locale === 'bn' && exhibition.curatorial_statement_bn ? exhibition.curatorial_statement_bn : exhibition.curatorial_statement_en
  const generalDesc = locale === 'bn' && exhibition.description_bn ? exhibition.description_bn : exhibition.description_en
  const venue = locale === 'bn' && exhibition.venue_bn ? exhibition.venue_bn : exhibition.venue_en

  // Date Formatters
  const dateFmt = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const shortDateFmt = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' })
  
  const regStart = exhibition.registration_start ? new Date(exhibition.registration_start) : null
  const subEnd = exhibition.submission_end ? new Date(exhibition.submission_end) : null
  const exStart = exhibition.exhibition_start ? new Date(exhibition.exhibition_start) : null
  const exEnd = exhibition.exhibition_end ? new Date(exhibition.exhibition_end) : null

  // Status Badge Logic
  const now = new Date()
  let statusBadgeText = exhibition.status
  let statusBadgeColor = "bg-white/10 text-white border-white/20"
  
  if (exhibition.status === 'upcoming') {
    if (regStart && subEnd && now >= regStart && now <= subEnd) {
      statusBadgeText = locale === 'bn' ? 'নিবন্ধন চলছে' : 'Registration Open'
      statusBadgeColor = "bg-emerald-500/20 text-emerald-50 border-emerald-500/30"
    } else if (regStart && now < regStart) {
      statusBadgeText = locale === 'bn' ? 'নিবন্ধন শীঘ্রই শুরু হবে' : 'Registration Opens Soon'
    } else if (subEnd && now > subEnd && exStart && now < exStart) {
      statusBadgeText = locale === 'bn' ? 'নিবন্ধন বন্ধ' : 'Submission Closed'
      statusBadgeColor = "bg-amber-500/20 text-amber-50 border-amber-500/30"
    }
  } else if (exhibition.status === 'ongoing') {
    statusBadgeText = locale === 'bn' ? 'চলমান' : 'Live Now'
    statusBadgeColor = "bg-primary/90 text-primary-foreground border-primary"
  } else if (exhibition.status === 'archived') {
    statusBadgeText = locale === 'bn' ? 'সমাপ্ত' : 'Ended'
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end justify-center text-white pb-32 overflow-hidden exhibition-detail-hero">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent" />
        {exhibition.hero_image_url && (
          <Image src={exhibition.hero_image_url} alt={title} fill className="object-cover scale-105" priority quality={100} />
        )}
        <div className="relative z-20 text-center max-w-5xl px-6 space-y-8 mt-auto w-full">
          <Badge 
            variant="outline" 
            className={`text-xs tracking-[0.3em] font-bold uppercase px-4 py-1.5 shadow-xl backdrop-blur-md rounded-none transition-colors ${statusBadgeColor}`}
          >
            {statusBadgeText}
          </Badge>
          <h1 className="font-serif text-6xl md:text-8xl font-bold drop-shadow-2xl leading-[1.1] tracking-tight exhibition-detail-title">{title}</h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-base md:text-lg text-white/90 font-light tracking-wide pt-4">
            {exStart && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                <span>{exEnd ? `${shortDateFmt.format(exStart)} — ${dateFmt.format(exEnd)}` : dateFmt.format(exStart)}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                <span>{venue}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-40">
        
        {/* Timeline Visual Component */}
        {(regStart || subEnd || exStart || exEnd) && (
          <section className="border border-border/50 bg-muted/10 backdrop-blur-sm p-8 lg:p-12">
            <h2 className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-muted-foreground mb-12 text-center">
              {locale === 'bn' ? 'প্রদর্শনীর সময়রেখা' : 'Exhibition Timeline'}
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-0">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-border -z-10 -translate-y-1/2" />
              
              {[
                { label: locale === 'bn' ? 'নিবন্ধন শুরু' : 'Registration Opens', date: regStart },
                { label: locale === 'bn' ? 'জমা দেওয়ার শেষ দিন' : 'Submission Deadline', date: subEnd },
                { label: locale === 'bn' ? 'প্রদর্শনী শুরু' : 'Exhibition Opens', date: exStart },
                { label: locale === 'bn' ? 'প্রদর্শনী সমাপ্ত' : 'Exhibition Closes', date: exEnd }
              ].map((item, i) => item.date ? (
                <div key={i} className="flex flex-row md:flex-col items-center gap-4 md:gap-6 bg-background/80 md:bg-transparent md:px-4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${now > item.date ? 'bg-primary' : 'bg-muted border border-border/80'}`} />
                  <div className="text-left md:text-center">
                    <p className="font-bold text-sm tracking-wide uppercase">{item.label}</p>
                    <p className="text-muted-foreground font-serif italic mt-1">{dateFmt.format(item.date)}</p>
                  </div>
                </div>
              ) : null)}
            </div>
          </section>
        )}

        {/* Description & Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8 space-y-20 text-xl leading-relaxed text-foreground/80 font-serif">
            
            {curatorialStmt && (
              <div className="space-y-8">
                <h2 className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-muted-foreground mb-8 border-b border-border/50 pb-4">
                  {locale === 'bn' ? 'কিউরেটোরিয়াল বিবৃতি' : 'Curatorial Statement'}
                </h2>
                <div className="whitespace-pre-line drop-cap text-2xl leading-[1.8] text-foreground exhibition-detail-body">
                  {curatorialStmt}
                </div>
              </div>
            )}

            {generalDesc && (
              <div className="space-y-8">
                <h2 className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-muted-foreground mb-8 border-b border-border/50 pb-4">
                  {locale === 'bn' ? 'প্রদর্শনীর বিবরণ' : 'Exhibition Description'}
                </h2>
                <div className="whitespace-pre-line text-xl leading-[1.8] text-foreground/90">
                  {generalDesc}
                </div>
              </div>
            )}

            {!curatorialStmt && !generalDesc && (
              <div className="text-center p-12 border border-dashed border-border/50 text-muted-foreground italic">
                {locale === 'bn' ? 'এই প্রদর্শনীর জন্য কোনো বিবরণ প্রদান করা হয়নি।' : 'No description has been provided for this exhibition.'}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-10 bg-muted/10 p-10 border border-border/50 backdrop-blur-sm shadow-sm exhibition-detail-sticky">
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-muted-foreground border-b border-border/50 pb-4">
                {locale === 'bn' ? 'সংক্ষিপ্ত তথ্য' : 'At a Glance'}
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col gap-1">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{locale === 'bn' ? 'অবস্থা' : 'Status'}</span>
                  <span className="font-serif text-lg text-primary">{statusBadgeText}</span>
                </li>
                {venue && (
                  <li className="flex flex-col gap-1">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{locale === 'bn' ? 'স্থান' : 'Venue'}</span>
                    <span className="font-serif text-lg">{venue}</span>
                  </li>
                )}
                {exStart && (
                  <li className="flex flex-col gap-1">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{locale === 'bn' ? 'শুরুর তারিখ' : 'Opening Date'}</span>
                    <span className="font-serif text-lg">{dateFmt.format(exStart)}</span>
                  </li>
                )}
                {exEnd && (
                  <li className="flex flex-col gap-1">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{locale === 'bn' ? 'সমাপ্তির তারিখ' : 'Closing Date'}</span>
                    <span className="font-serif text-lg">{dateFmt.format(exEnd)}</span>
                  </li>
                )}
                {regStart && (
                  <li className="flex flex-col gap-1 pt-4 border-t border-border/20">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{locale === 'bn' ? 'নিবন্ধন শুরু' : 'Registration Opens'}</span>
                    <span className="font-serif text-lg">{dateFmt.format(regStart)}</span>
                  </li>
                )}
                {subEnd && (
                  <li className="flex flex-col gap-1">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">{locale === 'bn' ? 'জমা দেওয়ার শেষ দিন' : 'Submission Deadline'}</span>
                    <span className="font-serif text-lg">{dateFmt.format(subEnd)}</span>
                  </li>
                )}
              </ul>
              
              <div className="pt-8 border-t border-border/50">
                <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                  {locale === 'bn' ? 'অফিসিয়াল ক্যাটালগ' : 'Official Catalog'}
                </h3>
                {catalog && exhibition.status !== 'upcoming' && exhibition.status !== 'draft' ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                      {locale === 'bn' 
                        ? 'প্রদর্শনী, শিল্পকর্ম এবং শিল্পীদের বিবরণ সম্বলিত অফিসিয়াল প্রকাশনা।' 
                        : 'Download the official exhibition publication containing featured artworks, participating artists, and exhibition highlights.'}
                    </p>
                    <Link 
                      href={`/catalogs/${catalog.id}`}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-none border border-border/50 bg-background hover:bg-muted text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Preview Catalog
                    </Link>
                    <CatalogDownloadButton 
                      catalog={catalog} 
                      className="w-full h-12 rounded-none uppercase tracking-widest text-xs font-bold transition-all flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90" 
                    />
                  </div>
                ) : (exhibition.status === 'upcoming' || exhibition.status === 'draft') ? (
                  <div className="text-center py-6 border border-dashed border-border/50 bg-background/50">
                    <p className="text-sm italic text-muted-foreground">
                      {locale === 'bn' 
                        ? 'প্রদর্শনী শুরু হওয়ার পর ক্যাটালগ উপলব্ধ হবে।' 
                        : 'Catalog will be available once the exhibition opens.'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border/50 bg-background/50">
                    <p className="text-sm italic text-muted-foreground">
                      {locale === 'bn' 
                        ? 'এই প্রদর্শনীর জন্য কোনো অফিসিয়াল ক্যাটালগ প্রকাশিত হয়নি।' 
                        : 'No official catalog has been published for this exhibition.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artworks Preview */}
        {exhibition.status !== 'upcoming' && exhibition.status !== 'draft' && exhibition.artworks && exhibition.artworks.length > 0 && (
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/50 pb-6">
              <h2 className="font-serif text-4xl font-bold">{locale === 'bn' ? 'নির্বাচিত শিল্পকর্ম' : 'Exhibition Highlights'}</h2>
              <Button variant="link" className="uppercase tracking-widest text-xs font-bold px-0 text-foreground hover:text-foreground/70" asChild>
                <Link href={`/gallery?exhibition=${exhibition.id}`}>
                  {locale === 'bn' ? 'সম্পূর্ণ গ্যালারি' : 'View Full Gallery'} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {exhibition.artworks.slice(0, 4).map((art: Record<string, any>) => (
                <Link key={art.id} href={`/gallery/artwork/${art.id}`} className="group relative aspect-[3/4] bg-muted overflow-hidden bg-card cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all duration-500">
                  {art.main_image_url && (
                    <Image src={art.main_image_url} alt="Artwork" fill className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 flex flex-col justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <p className="font-serif text-xl font-bold text-white line-clamp-1 drop-shadow-md">{locale === 'bn' && art.title_bn ? art.title_bn : art.title_en}</p>
                    <div className="h-[1px] w-8 bg-white/50 my-3" />
                    <p className="text-xs text-white/90 tracking-wide uppercase">
                      {(() => {
                        const p = Array.isArray(art.profiles) ? art.profiles[0] : art.profiles
                        if (!p) return null
                        return p.full_name_en || p.full_name_bn || null
                      })()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Committee Members */}
        {exhibition.committee_members && exhibition.committee_members.length > 0 && (
          <section className="space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="font-serif text-4xl font-bold">{locale === 'bn' ? 'কমিটি' : 'Curatorial Team'}</h2>
              <p className="text-muted-foreground text-lg font-light">
                {locale === 'bn' ? 'এই প্রদর্শনীর রূপকারগণ' : 'The visionary committee behind this exhibition.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
              {exhibition.committee_members.map((member: Record<string, any>) => (
                <div key={member.id} className="text-center space-y-6 group w-48">
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-muted shadow-lg transition-transform duration-500 group-hover:scale-110">
                    {member.profiles?.avatar_url ? (
                      <Image src={member.profiles.avatar_url} alt="Avatar" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <Users className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    )}
                  </div>
                  <div>
                    <p className="font-serif text-xl font-bold group-hover:text-foreground/70 transition-colors">
                      {(() => {
                        const p = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
                        return p?.full_name_en || p?.full_name_bn || 'Committee Member'
                      })()}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{locale === 'bn' && member.role_title_bn ? member.role_title_bn : member.role_title_en}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
