import { FeaturedArtworksContent } from "./FeaturedArtworksContent"

const fallbackArtworks = [
  { id: '1', title_en: "The Silent Symphony", title_bn: "নীরব সিম্ফনি", artist_name: "Abanindranath Tagore", medium_en: "Oil on Canvas", year: 2026, main_image_url: "/images/placeholders/artwork-1.webp" },
  { id: '2', title_en: "Echoes of Bengal", title_bn: "বাংলার প্রতিধ্বনি", artist_name: "Jamini Roy", medium_en: "Tempera on Cloth", year: 2025, main_image_url: "/images/placeholders/artwork-2.webp" },
  { id: '3', title_en: "Monsoon Dreams", title_bn: "বর্ষার স্বপ্ন", artist_name: "Nandalal Bose", medium_en: "Watercolor", year: 2026, main_image_url: "/images/placeholders/artwork-3.webp" },
  { id: '4', title_en: "Golden Hour", title_bn: "সোনালী মুহূর্ত", artist_name: "Rabindranath Tagore", medium_en: "Mixed Media & Gold Leaf", year: 2026, main_image_url: "/images/placeholders/artwork-4.webp" },
  { id: '5', title_en: "Abstract Forms", title_bn: "বিমূর্ত রূপ", artist_name: "Binode Bihari Mukherjee", medium_en: "Acrylic on Canvas", year: 2025, main_image_url: "/images/placeholders/artwork-5.webp" },
  { id: '6', title_en: "River of Light", title_bn: "আলোর নদী", artist_name: "Pratima Devi", medium_en: "Pastel on Paper", year: 2026, main_image_url: "/images/placeholders/artwork-6.webp" },
]

export async function HomeFeaturedArtworks({ locale, artworks }: { locale: string, artworks?: any[] }) {
  const hasData = artworks && artworks.length > 0
  const displayData = hasData ? artworks : fallbackArtworks
  return <FeaturedArtworksContent locale={locale} displayData={displayData} hasData={hasData || false} />
}
