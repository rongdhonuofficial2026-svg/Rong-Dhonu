import { FeaturedArtistsContent } from "./FeaturedArtistsContent"

export async function HomeFeaturedArtists({ locale, artists }: { locale: string, artists?: any[] }) {
  const displayData = artists ? artists.slice(0, 4) : []
  return <FeaturedArtistsContent locale={locale} artists={displayData} />
}
