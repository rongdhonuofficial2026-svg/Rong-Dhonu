 
 
import { createClient } from "@/lib/supabase/server"
import { SectionHeading } from "@/components/museum/section-heading"
import { FeaturedArtworksContent } from "./FeaturedArtworksContent"

const fallbackArtworks = [
  { id: '1', title_en: "The Silent Symphony", title_bn: "নীরব সিম্ফনি", artist_name: "Abanindranath Tagore", medium_en: "Oil on Canvas", main_image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800", status: "available" },
  { id: '2', title_en: "Echoes of Bengal", title_bn: "বাংলার প্রতিধ্বনি", artist_name: "Jamini Roy", medium_en: "Tempera on Cloth", main_image_url: "https://images.unsplash.com/photo-1582561424760-0321d6837943?auto=format&fit=crop&q=80&w=800", status: "sold" },
  { id: '3', title_en: "Monsoon Dreams", title_bn: "বর্ষার স্বপ্ন", artist_name: "Nandalal Bose", medium_en: "Watercolor", main_image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c026109?auto=format&fit=crop&q=80&w=800", status: "available" },
]

export async function HomeFeaturedArtworks({ locale }: { locale: string }) {
  const supabase = await createClient()
  
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
    <section className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeading 
          title={locale === 'bn' ? "প্রদর্শিত শিল্পকর্ম" : "Curated Collection"} 
          subtitle={locale === 'bn' ? "আমাদের সর্বশেষ সংগ্রহ থেকে নির্বাচিত কিছু সেরা কাজ" : "A curated selection of masterpieces from our latest collection."}
        />
        
        <div className="mt-16">
          <FeaturedArtworksContent locale={locale} displayData={displayData} hasData={hasData || false} />
        </div>
      </div>
    </section>
  )
}
