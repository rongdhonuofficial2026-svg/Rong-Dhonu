import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rongdhonu.art'
  const locales = ['en', 'bn']
  const now = new Date()

  // Static pages
  const staticRoutes = [
    '',
    '/exhibitions',
    '/gallery',
    '/artists',
    '/catalogs',
    '/about',
    '/contact',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${route}`])
        ),
      },
    }))
  )

  const supabase = await createClient()

  // Dynamic exhibition pages
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('id, updated_at')
    .in('status', ['upcoming', 'ongoing', 'archived'])
    .neq('is_deleted', true)

  const exhibitionEntries: MetadataRoute.Sitemap = (exhibitions || []).flatMap(
    (ex) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/exhibitions/${ex.id}`,
        lastModified: new Date(ex.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/exhibitions/${ex.id}`])
          ),
        },
      }))
  )

  // Dynamic artwork / gallery pages
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, updated_at')
    .eq('status', 'approved')

  const artworkEntries: MetadataRoute.Sitemap = (artworks || []).flatMap((art) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/gallery/artwork/${art.id}`,
      lastModified: new Date(art.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/gallery/artwork/${art.id}`])
        ),
      },
    }))
  )

  // Artist profile pages
  const { data: artists } = await supabase
    .from('profiles')
    .select('slug, updated_at')
    .eq('role', 'member')
    .not('slug', 'is', null)

  const artistEntries: MetadataRoute.Sitemap = (artists || []).flatMap(
    (artist) =>
      artist.slug
        ? locales.map((locale) => ({
            url: `${baseUrl}/${locale}/artists/${artist.slug}`,
            lastModified: new Date(artist.updated_at),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
            alternates: {
              languages: Object.fromEntries(
                locales.map((l) => [l, `${baseUrl}/${l}/artists/${artist.slug}`])
              ),
            },
          }))
        : []
  )

  return [
    ...staticEntries,
    ...exhibitionEntries,
    ...artworkEntries,
    ...artistEntries,
  ]
}
