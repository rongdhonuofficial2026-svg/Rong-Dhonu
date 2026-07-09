import { HomeHero } from "@/components/home/HomeHero"
import { HomeAbout } from "@/components/home/HomeAbout"
import { HomeFeaturedArtworks } from "@/components/home/FeaturedArtworks"
import { HomeFeaturedArtists } from "@/components/home/FeaturedArtists"
import { HomeExhibition } from "@/components/home/HomeExhibition"
import { HomeNewsletter } from "@/components/home/HomeExtras"
import { HomeSponsors, HomeTestimonials } from "@/components/home/HomeSponsors"
import { generateDynamicMetadata, generateOrganizationSchema } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"
import "@/../css/home.css"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { getCmsContent } = await import('@/lib/cms/content')
  const settingsData = await getCmsContent('global', 'settings', locale)
  
  const siteName = settingsData?.site_name || 'Rongdhono'
  const faviconUrl = settingsData?.favicon_url
  const siteDescription = settingsData?.site_description || (
    locale === 'bn'
      ? "রংধনু শিল্পী সংঘের অফিসিয়াল ওয়েবসাইট এবং ডিজিটাল মিউজিয়াম।"
      : "The official website and digital museum of the Rongdhono artists' collective."
  )

  return generateDynamicMetadata({
    title: locale === 'bn' ? "হোম" : "Home",
    description: siteDescription,
    url: '/',
    locale,
    siteName,
    faviconUrl,
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const jsonLd = generateOrganizationSchema()
  
  const supabase = await createClient()

  // 1. Determine which exhibition to show based on priority rules + lazy lifecycle sync
  const { getFeaturedExhibition, syncExhibitionLifecycle } = await import('@/lib/exhibition-lifecycle');
  const exhibition = await getFeaturedExhibition();

  // Query dynamic counts for stats section
  const [exhibitionsCountRes, artistsCountRes, artworksCountRes] = await Promise.all([
    supabase.from('exhibitions').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['member', 'committee']),
    supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('status', 'approved')
  ])

  const totalExhibitions = exhibitionsCountRes.count || 14
  const totalArtists = artistsCountRes.count || 340
  const totalArtworks = artworksCountRes.count || 1200
  const stats = { totalExhibitions, totalArtists, totalArtworks }

  // If no exhibition at all, handle gracefully.
  let artworks: any[] = []
  let artists: any[] = []

  if (exhibition) {
    const [artworksRes, artistArtworkRowsRes] = await Promise.all([
      // Artworks with full artist profile (avatar + name)
      supabase.from('artworks')
        .select(`
          id, title_en, title_bn, main_image_url, category, medium_en,
          profiles!artist_id(id, full_name_en, full_name_bn, avatar_url)
        `)
        .eq('status', 'approved')
        .eq('exhibition_id', exhibition.id)
        .limit(8),
      
      supabase.from('artworks')
        .select(`
          artist_id,
          profiles!artist_id(id, full_name_en, full_name_bn, avatar_url, bio_en, slug, role)
        `)
        .eq('status', 'approved')
        .eq('exhibition_id', exhibition.id)
        .not('artist_id', 'is', null)
    ])

    artworks = artworksRes.data || []
    
    if (artistArtworkRowsRes.data) {
      const artistMap = new Map<string, any>()
      artistArtworkRowsRes.data.forEach((row: any) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
        if (profile?.id && !artistMap.has(profile.id)) {
          artistMap.set(profile.id, profile)
        }
      })
      artists = Array.from(artistMap.values()).sort((a, b) => {
        const aName = (a.full_name_en || a.full_name_bn || '').toString()
        const bName = (b.full_name_en || b.full_name_bn || '').toString()
        return aName.localeCompare(bName, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id)
      })
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full">
        <HomeHero locale={locale} exhibition={exhibition} stats={stats} />
        <HomeAbout locale={locale} stats={stats} />
        <HomeExhibition locale={locale} exhibition={exhibition} />
        <HomeFeaturedArtists locale={locale} artists={artists} />
        <HomeFeaturedArtworks locale={locale} artworks={artworks} />
        <HomeTestimonials locale={locale} />
        <HomeSponsors locale={locale} />
        <HomeNewsletter locale={locale} />
      </main>
    </>
  )
}
