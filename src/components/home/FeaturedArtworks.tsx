 
 
import { createClient } from "@/lib/supabase/server"
import { SectionHeading } from "@/components/museum/section-heading"
import { GalleryGrid } from "@/components/museum/gallery-grid"
import { ArtworkCard } from "@/components/museum/artwork-card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { EmptyState } from "@/components/museum/states"

const fallbackArtworks = [
  { id: '1', title_en: "The Silent Symphony", title_bn: "নীরব সিম্ফনি", artist_name: "Abanindranath Tagore", medium_en: "Oil on Canvas", main_image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800", status: "available" },
  { id: '2', title_en: "Echoes of Bengal", title_bn: "বাংলার প্রতিধ্বনি", artist_name: "Jamini Roy", medium_en: "Tempera on Cloth", main_image_url: "https://images.unsplash.com/photo-1582561424760-0321d6837943?auto=format&fit=crop&q=80&w=800", status: "sold" },
  { id: '3', title_en: "Monsoon Dreams", title_bn: "বর্ষার স্বপ্ন", artist_name: "Nandalal Bose", medium_en: "Watercolor", main_image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c026109?auto=format&fit=crop&q=80&w=800", status: "available" },
]

export async function HomeFeaturedArtworks({ locale }: { locale: string }) {
  const supabase = await createClient()
  
  // Ideally, we would have an 'is_featured' boolean on artworks table, or fetch the latest 3 approved.
  // For now, fetch 3 random approved artworks.
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(`
      id,
      title_en,
      title_bn,
      medium_en,
      medium_bn,
      main_image_url,
      status,
      artist_id,
      profiles:artist_id(full_name_en, full_name_bn)
    `)
    .eq('status', 'approved')
    .limit(3)

  const hasData = artworks && artworks.length > 0
  const displayData = hasData ? artworks : fallbackArtworks

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={locale === 'bn' ? "প্রদর্শিত শিল্পকর্ম" : "Featured Artworks"} 
          subtitle={locale === 'bn' ? "আমাদের সর্বশেষ সংগ্রহ থেকে নির্বাচিত কিছু সেরা কাজ" : "A curated selection of masterpieces from our latest collection."}
        />
        
        {displayData.length === 0 ? (
          <EmptyState title="No artworks available" />
        ) : (
          <GalleryGrid columns="3">
            {displayData.map((artwork: any) => {
              const title = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
              const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
              const artistName = hasData 
                ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
                : artwork.artist_name

              return (
                <div key={artwork.id} className="break-inside-avoid">
                  <Link href={`/gallery/${artwork.id}`}>
                    <ArtworkCard
                      title={title}
                      artistName={artistName || "Unknown Artist"}
                      medium={medium}
                      imageUrl={artwork.main_image_url}
                      status={artwork.status as any}
                    />
                  </Link>
                </div>
              )
            })}
          </GalleryGrid>
        )}
        
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/gallery">{locale === 'bn' ? 'সম্পূর্ণ গ্যালারি দেখুন' : 'Explore Full Gallery'}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
