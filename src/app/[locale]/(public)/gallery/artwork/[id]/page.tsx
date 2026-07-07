import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ZoomIn, Info, Palette, Ruler, User } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: artwork } = await supabase
    .from('artworks')
    .select('title_en, title_bn, description_en, description_bn, main_image_url, profiles(first_name_en, last_name_en)')
    .eq('id', id)
    .maybeSingle()
  
  if (!artwork) return {}

  const title = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
  const desc = locale === 'bn' && artwork.description_bn ? artwork.description_bn : artwork.description_en
  
  // profiles might be returned as an array or object depending on join, safely handle it
  const profile = Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles
  const artist = profile ? `${profile.first_name_en} ${profile.last_name_en}` : 'Unknown'

  return {
    title: `${title} by ${artist} | Rongdhono Gallery`,
    description: desc,
    openGraph: {
      title: `${title} | Rongdhono Gallery`,
      description: desc,
      images: artwork.main_image_url ? [artwork.main_image_url] : []
    }
  }
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles!inner(*),
      exhibitions!inner(year, theme_en, theme_bn)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  if (error || !artwork) return notFound()

  // SEO JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title_en,
    alternateName: artwork.title_bn,
    image: artwork.main_image_url,
    description: artwork.description_en,
    creator: {
      '@type': 'Person',
      name: Array.isArray(artwork.profiles) 
        ? `${artwork.profiles[0]?.first_name_en} ${artwork.profiles[0]?.last_name_en}`
        : `${(artwork.profiles as any)?.first_name_en} ${(artwork.profiles as any)?.last_name_en}`,
      url: `https://rongdhono.org/${locale}/artists/${Array.isArray(artwork.profiles) ? artwork.profiles[0]?.id : (artwork.profiles as any)?.id}`
    },
    artMedium: artwork.medium_en,
    artworkSurface: artwork.materials_en,
    dateCreated: artwork.year,
    offers: artwork.price ? {
      '@type': 'Offer',
      price: artwork.price,
      priceCurrency: 'BDT',
      availability: artwork.availability === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    } : undefined
  }

  const title = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
  const desc = locale === 'bn' && artwork.description_bn ? artwork.description_bn : artwork.description_en
  const medium = locale === 'bn' && artwork.medium_bn ? artwork.medium_bn : artwork.medium_en
  const materials = locale === 'bn' && artwork.materials_bn ? artwork.materials_bn : artwork.materials_en
  
  const profile = Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles
  const artistName = locale === 'bn' && profile?.full_name_bn ? profile.full_name_bn : `${profile?.first_name_en} ${profile?.last_name_en}`
  const artistId = profile?.id

  return (
    <main className="min-h-screen py-12 px-4 md:px-8 max-w-[1400px] mx-auto space-y-12">
      {/* JSON-LD injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/gallery?exhibition=${artwork.exhibition_id}`}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gallery
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Image Section */}
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

          {/* Carousel for additional images could go here */}
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

        {/* Details Section */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <Badge variant="outline" className="mb-4">{artwork.category || 'Artwork'}</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{title}</h1>
            <p className="text-xl text-muted-foreground mb-4">
              by <Link href={`/artists/${artistId}`} className="text-foreground hover:text-accent font-medium hover:underline transition-colors">{artistName}</Link>
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
            {artwork.exhibitions && (
              <div className="flex gap-3 text-muted-foreground">
                <Info className="w-5 h-5 shrink-0 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">{locale === 'bn' ? 'প্রদর্শনী' : 'Exhibited In'}</p>
                  <p>
                    {Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0]?.year : (artwork.exhibitions as any)?.year} - 
                    {locale === 'bn' && (Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0]?.theme_bn : (artwork.exhibitions as any)?.theme_bn) 
                      ? (Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0]?.theme_bn : (artwork.exhibitions as any)?.theme_bn) 
                      : (Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0]?.theme_en : (artwork.exhibitions as any)?.theme_en)}
                  </p>
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

          <div className="pt-6 border-t border-border">
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/artists/${artistId}`}>
                <User className="w-4 h-4 mr-2" />
                {locale === 'bn' ? 'শিল্পীর প্রোফাইল দেখুন' : 'View Artist Profile'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
