 
 
import { FeaturedArtworksContent } from "./FeaturedArtworksContent"

const fallbackArtworks = [
  { id: '1', title_en: "The Silent Symphony", title_bn: "নীরব সিম্ফনি", artist_name: "Abanindranath Tagore", medium_en: "Oil on Canvas", main_image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800", status: "available" },
  { id: '2', title_en: "Echoes of Bengal", title_bn: "বাংলার প্রতিধ্বনি", artist_name: "Jamini Roy", medium_en: "Tempera on Cloth", main_image_url: "https://images.unsplash.com/photo-1582561424760-0321d6837943?auto=format&fit=crop&q=80&w=800", status: "sold" },
  { id: '3', title_en: "Monsoon Dreams", title_bn: "বর্ষার স্বপ্ন", artist_name: "Nandalal Bose", medium_en: "Watercolor", main_image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c026109?auto=format&fit=crop&q=80&w=800", status: "available" },
]

export async function HomeFeaturedArtworks({ locale, artworks }: { locale: string, artworks?: any[] }) {
  const hasData = artworks && artworks.length > 0
  const displayData = hasData ? artworks : fallbackArtworks

  return (
    <section className="py-24 md:py-40 bg-[#111111] overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <FeaturedArtworksContent locale={locale} displayData={displayData} hasData={hasData || false} />
      </div>
    </section>
  )
}
