import { FeaturedArtworksContent } from "./FeaturedArtworksContent"

export async function HomeFeaturedArtworks({ locale, artworks }: { locale: string, artworks?: any[] }) {
  const displayData = artworks || []
  return <FeaturedArtworksContent locale={locale} displayData={displayData} hasData={displayData.length > 0} />
}
