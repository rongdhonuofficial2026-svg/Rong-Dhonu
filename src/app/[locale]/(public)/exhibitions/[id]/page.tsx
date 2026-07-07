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
  const { data: exhibition } = await supabase.from('exhibitions').select('theme_en, theme_bn, description_en, description_bn, hero_image_url').eq('id', id).single()
  
  if (!exhibition) return {}

  const title = locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en
  const description = locale === 'bn' && exhibition.description_bn ? exhibition.description_bn : exhibition.description_en

  return {
    title: `${title} | Rongdhono`,
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

  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .select(`
      *,
      events(*),
      committee_members(*, profiles(first_name_en, last_name_en, avatar_url)),
      artworks!inner(id, title_en, title_bn, main_image_url, profiles(first_name_en, last_name_en))
    `)
    .eq('id', id)
    .eq('artworks.status', 'approved')
    .single()

  if (error || !exhibition) return notFound()

  // Fetch the published catalog for this exhibition
  const { data: catalog } = await supabase
    .from('catalogs')
    .select('id, title_en, title_bn, pdf_url, total_downloads')
    .eq('exhibition_id', id)
    .eq('status', 'published')
    .maybeSingle()

  const title = locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en
  const desc = locale === 'bn' && exhibition.description_bn ? exhibition.description_bn : exhibition.description_en
  const venue = locale === 'bn' && exhibition.venue_bn ? exhibition.venue_bn : exhibition.venue_en

  return (
    <main className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end justify-center text-white pb-32 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent" />
        {exhibition.hero_image_url && (
          <Image src={exhibition.hero_image_url} alt={title} fill className="object-cover scale-105" priority quality={100} />
        )}
        <div className="relative z-20 text-center max-w-5xl px-6 space-y-8 mt-auto w-full">
          <Badge 
            variant="outline" 
            className="text-xs tracking-[0.3em] font-bold uppercase px-4 py-1.5 shadow-xl bg-white/10 backdrop-blur-md text-white border-white/20 rounded-none"
          >
            {exhibition.status === 'active' ? 'ongoing' : exhibition.status}
          </Badge>
          <h1 className="font-serif text-6xl md:text-8xl font-bold drop-shadow-2xl leading-[1.1] tracking-tight">{title}</h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-lg md:text-xl text-white/90 font-light tracking-wide pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              <span>{exhibition.year}</span>
            </div>
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
        
        {/* Description & Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8 space-y-8 text-xl leading-relaxed text-foreground/80 font-serif">
            <h2 className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-muted-foreground mb-8 border-b border-border/50 pb-4">
              {locale === 'bn' ? 'প্রদর্শনীর সম্পর্কে' : 'Curatorial Statement'}
            </h2>
            <div className="whitespace-pre-line drop-cap text-2xl leading-[1.8] text-foreground">
              {desc}
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-10 bg-muted/10 p-10 border border-border/50 backdrop-blur-sm shadow-sm">
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-muted-foreground border-b border-border/50 pb-4">
                {locale === 'bn' ? 'সংক্ষিপ্ত তথ্য' : 'At a Glance'}
              </h3>
              <ul className="space-y-6">
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Artworks</span>
                  <span className="font-serif text-2xl font-bold">{exhibition.artworks?.length || 0}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Start Date</span>
                  <span className="font-serif text-lg">{exhibition.exhibition_start ? new Date(exhibition.exhibition_start).toLocaleDateString(undefined, {month:'long', day:'numeric'}) : 'TBD'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">End Date</span>
                  <span className="font-serif text-lg">{exhibition.exhibition_end ? new Date(exhibition.exhibition_end).toLocaleDateString(undefined, {month:'long', day:'numeric'}) : 'TBD'}</span>
                </li>
              </ul>
              
              <div className="pt-8 border-t border-border/50">
                <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                  {locale === 'bn' ? 'অফিসিয়াল ক্যাটালগ' : 'Official Catalog'}
                </h3>
                {exhibition.status === 'upcoming' || exhibition.status === 'draft' ? (
                  <div className="text-center py-6 border border-dashed border-border/50 bg-background/50">
                    <p className="text-sm italic text-muted-foreground">
                      {locale === 'bn' 
                        ? 'প্রদর্শনী শুরু হওয়ার পর ক্যাটালগ উপলব্ধ হবে।' 
                        : 'Catalog will be available once the exhibition opens.'}
                    </p>
                  </div>
                ) : catalog ? (
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
                    <p className="text-xs text-white/90 tracking-wide uppercase">{art.profiles?.first_name_en} {art.profiles?.last_name_en}</p>
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
                    <p className="font-serif text-xl font-bold group-hover:text-foreground/70 transition-colors">{member.profiles?.first_name_en} {member.profiles?.last_name_en}</p>
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
