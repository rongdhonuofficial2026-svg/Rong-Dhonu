import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { generateDynamicMetadata, generateArtworkSchema } from "@/lib/seo"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Expand } from "lucide-react"

export async function generateMetadata({ params: { id, locale } }: { params: { id: string, locale: string } }) {
  const supabase = await createClient()
  const { data } = await supabase.from('artworks').select('*').eq('id', id).single()
  
  if (!data) return generateDynamicMetadata({ title: "Not Found", description: "", url: `/gallery/${id}` })
  
  const title = locale === 'bn' ? (data.title_bn || data.title_en) : data.title_en
  return generateDynamicMetadata({
    title,
    description: locale === 'bn' ? (data.description_bn || data.description_en) : data.description_en,
    url: `/gallery/${id}`,
    imageUrl: data.main_image_url,
    locale
  })
}

export default async function ArtworkDetailPage({ params: { id, locale } }: { params: { id: string, locale: string } }) {
  const supabase = await createClient()
  
  let artwork
  if (['1', '2', '3', '4', '5'].includes(id)) {
    // Fallback data
    artwork = {
      id,
      title_en: "The Silent Symphony",
      title_bn: "নীরব সিম্ফনি",
      description_en: "A beautiful exploration of color and silence.",
      description_bn: "রঙ এবং নীরবের একটি সুন্দর অন্বেষণ।",
      medium_en: "Oil on Canvas",
      medium_bn: "ক্যানভাসে তেল",
      dimensions: "24 x 36 inches",
      year: 2026,
      status: "available",
      price: 15000,
      main_image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1200",
      artist_id: "preview-artist",
      artist_name: "Abanindranath Tagore"
    }
  } else {
    const { data } = await supabase.from('artworks').select(`
      *,
      profiles:artist_id(full_name_en, full_name_bn, avatar_url)
    `).eq('id', id).single()
    if (!data) notFound()
    
    artwork = {
      ...data,
      artist_name: locale === 'bn' ? (data.profiles?.full_name_bn || data.profiles?.full_name_en) : data.profiles?.full_name_en
    }
  }

  const jsonLd = generateArtworkSchema(artwork)
  
  const title = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
  const description = locale === 'bn' ? (artwork.description_bn || artwork.description_en) : artwork.description_en
  const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen pt-32 pb-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/gallery"><ArrowLeft className="w-4 h-4 mr-2" /> {locale === 'bn' ? "গ্যালারিতে ফিরে যান" : "Back to Gallery"}</Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image Viewer */}
            <div className="relative aspect-[3/4] w-full bg-muted rounded-2xl overflow-hidden group cursor-pointer border border-border shadow-sm">
              <Image 
                src={artwork.main_image_url} 
                alt={title}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Expand className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-10 py-4">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h1 className="font-serif text-4xl md:text-5xl font-bold">{title}</h1>
                  <Badge variant={artwork.status === 'available' ? 'default' : 'secondary'} className="text-sm">
                    {artwork.status === 'available' ? (locale === 'bn' ? 'উপলব্ধ' : 'Available') : (locale === 'bn' ? 'বিক্রিত' : 'Sold / Not for Sale')}
                  </Badge>
                </div>
                
                <Link href={`/artists/${artwork.artist_id}`} className="inline-flex items-center gap-3 hover:text-accent transition-colors">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {artwork.profiles?.avatar_url ? (
                      <Image src={artwork.profiles.avatar_url} alt={artwork.artist_name} width={40} height={40} className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium text-xl">{artwork.artist_name}</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8 py-8 border-y border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{locale === 'bn' ? "মাধ্যম" : "Medium"}</p>
                  <p className="font-medium">{medium}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{locale === 'bn' ? "মাত্রা" : "Dimensions"}</p>
                  <p className="font-medium">{artwork.dimensions || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{locale === 'bn' ? "বছর" : "Year"}</p>
                  <p className="font-medium">{artwork.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{locale === 'bn' ? "মূল্য" : "Price"}</p>
                  <p className="font-medium">{artwork.price ? `₹${artwork.price}` : 'On Request'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold mb-4">{locale === 'bn' ? "বর্ণনা" : "Description"}</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{description || 'No description provided.'}</p>
              </div>

              {artwork.status === 'available' && (
                <Button size="lg" className="w-full text-lg h-14" asChild>
                  <Link href={`/contact?inquiry=${artwork.id}`}>{locale === 'bn' ? "অনুসন্ধান করুন" : "Inquire About Artwork"}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
