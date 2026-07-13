import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ZoomIn, Info, Palette, Ruler, User } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: artwork } = await supabase
    .from('artworks')
    .select('title_en, title_bn, description_en, description_bn, main_image_url, profiles!artist_id(full_name_en, full_name_bn)')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  if (!artwork) return {}

  const title = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
  const desc = locale === 'bn' && artwork.description_bn ? artwork.description_bn : artwork.description_en
  const p = Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles
  const artist = (locale === 'bn' && p?.full_name_bn) ? p.full_name_bn : (p?.full_name_en ?? 'Unknown')

  return {
    title: `${title} by ${artist} | Rongdhonu Gallery`,
    description: desc,
    openGraph: {
      title: `${title} | Rongdhonu Gallery`,
      description: desc,
      images: artwork.main_image_url ? [artwork.main_image_url] : [],
    },
  }
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select(`
      id, title_en, title_bn, description_en, description_bn,
      medium_en, medium_bn, materials_en, materials_bn,
      dimensions, category, theme, price, availability,
      main_image_url, additional_images, year,
      exhibition_id, artist_id, created_at,
      profiles!artist_id(id, full_name_en, full_name_bn, avatar_url, bio_en, slug),
      exhibitions!exhibition_id(id, year, theme_en, theme_bn)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  if (error || !artwork) return notFound()

  const profile = Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles
  const exhibition = Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0] : artwork.exhibitions
  const artistName = (locale === 'bn' && profile?.full_name_bn) ? profile.full_name_bn : (profile?.full_name_en ?? 'Unknown Artist')
  const artistId = profile?.id ?? artwork.artist_id

  const title  = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
  const desc   = locale === 'bn' && artwork.description_bn ? artwork.description_bn : artwork.description_en
  const medium = locale === 'bn' && artwork.medium_bn ? artwork.medium_bn : artwork.medium_en

  // SEO JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'VisualArtwork',
    name:         artwork.title_en,
    alternateName: artwork.title_bn,
    image:         artwork.main_image_url,
    description:   artwork.description_en,
    creator: {
      '@type': 'Person',
      name: profile?.full_name_en,
      url:  `https://rongdhonu.org/${locale}/artists/${artistId}`,
    },
    artMedium:    artwork.medium_en,
    dateCreated:  artwork.year ?? exhibition?.year,
    offers: artwork.price ? {
      '@type':        'Offer',
      price:          artwork.price,
      priceCurrency:  'BDT',
      availability:   artwork.availability === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    } : undefined,
  }

  return (
    <main className="min-h-screen py-12 px-4 md:px-8 max-w-[1400px] mx-auto space-y-12 public-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/gallery`}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gallery
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Image */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-square md:aspect-[4/3] bg-muted rounded-2xl overflow-hidden group border border-border shadow-md">
            {artwork.main_image_url ? (
              <Image
                src={artwork.main_image_url}
                alt={title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="shadow-lg backdrop-blur-md bg-white/50 hover:bg-white/80">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Additional images */}
          {artwork.additional_images && artwork.additional_images.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {artwork.additional_images.map((url: string, idx: number) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg bg-muted border border-border overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                  <Image src={url} alt={`Detail ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <Badge variant="outline" className="mb-4">{artwork.category || 'Artwork'}</Badge>
            <h1 className="artwork-detail-title">{title}</h1>
            <p className="text-xl text-muted-foreground mb-4">
              by{' '}
              <Link href={`/artists/${artistId}`} className="text-foreground hover:text-accent font-medium hover:underline transition-colors">
                {artistName}
              </Link>
            </p>
            {artwork.price && (
              <div className="text-2xl font-mono font-bold text-emerald-600 mb-2">৳{artwork.price}</div>
            )}
            {artwork.availability && (
              <Badge variant={artwork.availability === 'available' ? 'default' : 'secondary'} className="uppercase text-xs">
                {artwork.availability.replace('_', ' ')}
              </Badge>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            {medium && (
              <div className="flex gap-3 text-muted-foreground">
                <Palette className="w-5 h-5 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">{locale === 'bn' ? 'মাধ্যম' : 'Medium'}</p>
                  <p>{medium}</p>
                </div>
              </div>
            )}
            {artwork.dimensions && (
              <div className="flex gap-3 text-muted-foreground">
                <Ruler className="w-5 h-5 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">{locale === 'bn' ? 'মাপ' : 'Dimensions'}</p>
                  <p>{artwork.dimensions}</p>
                </div>
              </div>
            )}
            {exhibition && (
              <div className="flex gap-3 text-muted-foreground">
                <Info className="w-5 h-5 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">{locale === 'bn' ? 'প্রদর্শনী' : 'Exhibited In'}</p>
                  <Link href={`/exhibitions/${exhibition.id}`} className="hover:text-accent transition-colors">
                    {exhibition.year} — {locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {desc && (
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="font-bold text-lg">{locale === 'bn' ? 'বিবরণ' : 'Description'}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          )}

          {/* Artist card */}
          {profile && (
            <div className="pt-6 border-t border-border">
              <Link href={`/artists/${artistId}`} className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={artistName} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Artist</p>
                  <p className="font-semibold group-hover:text-accent transition-colors">{artistName}</p>
                  {profile.bio_en && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{profile.bio_en}</p>}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
