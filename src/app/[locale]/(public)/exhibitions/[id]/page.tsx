import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/lib/i18n/routing"
import Image from "next/image"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: exhibition } = await supabase.from('exhibitions').select('title_en, title_bn, description_en, description_bn, hero_image_url').eq('id', id).single()
  
  if (!exhibition) return {}

  const title = locale === 'bn' && exhibition.title_bn ? exhibition.title_bn : exhibition.title_en
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

  const title = locale === 'bn' && exhibition.title_bn ? exhibition.title_bn : exhibition.title_en
  const desc = locale === 'bn' && exhibition.description_bn ? exhibition.description_bn : exhibition.description_en
  const venue = locale === 'bn' && exhibition.venue_bn ? exhibition.venue_bn : exhibition.venue_en

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/60 z-10" />
        {exhibition.hero_image_url && (
          <Image src={exhibition.hero_image_url} alt={title} fill className="object-cover" priority />
        )}
        <div className="relative z-20 text-center max-w-4xl px-4 space-y-6">
          <Badge variant={exhibition.status === 'active' ? 'default' : 'secondary'} className="text-sm px-4 py-1 mb-4 shadow-xl">
            {exhibition.status.toUpperCase()}
          </Badge>
          <h1 className="font-serif text-5xl md:text-7xl font-bold drop-shadow-xl">{title}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg md:text-xl text-white/90 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{exhibition.year}</span>
            </div>
            {venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{venue}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24">
        
        {/* Description & Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6 text-lg leading-relaxed text-muted-foreground">
            <h2 className="font-serif text-3xl font-bold text-foreground">{locale === 'bn' ? 'প্রদর্শনীর সম্পর্কে' : 'About the Exhibition'}</h2>
            <p>{desc}</p>
          </div>
          <div className="space-y-6 bg-muted/30 p-8 rounded-2xl border border-border">
            <h3 className="font-bold text-xl">{locale === 'bn' ? 'সংক্ষিপ্ত তথ্য' : 'At a Glance'}</h3>
            <ul className="space-y-4">
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Artworks</span>
                <span className="font-bold">{exhibition.artworks?.length || 0}</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-bold">{exhibition.start_date ? new Date(exhibition.start_date).toLocaleDateString() : 'TBD'}</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-bold">{exhibition.end_date ? new Date(exhibition.end_date).toLocaleDateString() : 'TBD'}</span>
              </li>
            </ul>
            {catalog ? (
              <a
                href={`/api/catalogs/download?id=${catalog.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  {locale === 'bn' ? 'অফিসিয়াল ক্যাটালগ ডাউনলোড করুন' : 'Download Official Catalog'}
                </Button>
              </a>
            ) : (
              <Button className="w-full mt-4" variant="outline" disabled>
                <Download className="w-4 h-4 mr-2" />
                {locale === 'bn' ? 'ক্যাটালগ শীঘ্রই আসছে' : 'Catalog Coming Soon'}
              </Button>
            )}
          </div>
        </section>

        {/* Featured Artworks Preview */}
        {exhibition.artworks && exhibition.artworks.length > 0 && (
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="font-serif text-3xl font-bold">{locale === 'bn' ? 'নির্বাচিত শিল্পকর্ম' : 'Featured Artworks'}</h2>
              <Button variant="ghost" asChild>
                <Link href={`/gallery?exhibition=${exhibition.id}`}>
                  {locale === 'bn' ? 'সব দেখুন' : 'View Gallery'} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exhibition.artworks.slice(0, 4).map((art: Record<string, any>) => (
                <Link key={art.id} href={`/gallery/artwork/${art.id}`} className="group relative aspect-square bg-muted overflow-hidden rounded-xl border border-border">
                  {art.main_image_url && (
                    <Image src={art.main_image_url} alt="Artwork" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                    <p className="font-bold truncate">{locale === 'bn' && art.title_bn ? art.title_bn : art.title_en}</p>
                    <p className="text-xs text-white/80 truncate">by {art.profiles?.first_name_en}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Committee Members */}
        {exhibition.committee_members && exhibition.committee_members.length > 0 && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-serif text-3xl font-bold">{locale === 'bn' ? 'কমিটি' : 'Organizing Committee'}</h2>
              <p className="text-muted-foreground">{locale === 'bn' ? 'এই প্রদর্শনীর রূপকারগণ' : 'The visionary team behind this exhibition.'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {exhibition.committee_members.map((member: Record<string, any>) => (
                <div key={member.id} className="text-center space-y-4">
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted border-2 border-border shadow-sm">
                    {member.profiles?.avatar_url ? (
                      <Image src={member.profiles.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <Users className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{member.profiles?.first_name_en} {member.profiles?.last_name_en}</p>
                    <p className="text-sm text-accent font-medium">{locale === 'bn' && member.role_title_bn ? member.role_title_bn : member.role_title_en}</p>
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
