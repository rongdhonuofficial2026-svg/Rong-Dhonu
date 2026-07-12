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
  const { getCmsContent, getCmsSectionLayout } = await import('@/lib/cms/content')
  const settingsData = await getCmsContent('global', 'settings', locale)
  
  const siteName = settingsData?.site_name || 'Rongdhonu'
  const faviconUrl = settingsData?.favicon_url
  const siteDescription = settingsData?.site_description || (
    locale === 'bn'
      ? "রংধনু শিল্পী সংঘের অফিসিয়াল ওয়েবসাইট এবং ডিজিটাল মিউজিয়াম।"
      : "The official website and digital museum of the Rongdhonu artists' collective."
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
  
  const { getCmsSectionLayout } = await import('@/lib/cms/content')
  const layout = await getCmsSectionLayout('home')

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

  // Helper to fetch artworks and gallery media for an exhibition
  async function fetchCuratedCollection(exhibitionId: string) {
    const [artworksRes, mediaRes] = await Promise.all([
      supabase.from('artworks')
        .select(`
          id, title_en, title_bn, main_image_url, category, medium_en, created_at,
          profiles!artist_id(id, full_name_en, full_name_bn, avatar_url)
        `)
        .eq('status', 'approved')
        .eq('exhibition_id', exhibitionId)
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(8),
      
      supabase.from('gallery_media')
        .select('id, title_en, title_bn, url, created_at, gallery_album_id, gallery_albums(slug)')
        .eq('status', 'published')
        .eq('exhibition_id', exhibitionId)
        .eq('media_type', 'image')
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(8)
    ])

    const artworksData = (artworksRes.data || []).map((a: any) => ({
      ...a,
      target_href: `/gallery/artwork/${a.id}`
    }))
    
    const mediaAsArtworks = (mediaRes.data || []).map((m: any) => {
      const albumData = Array.isArray(m.gallery_albums) ? m.gallery_albums[0] : m.gallery_albums
      const slugOrId = albumData?.slug || m.gallery_album_id || ''
      return {
        id: m.id,
        title_en: m.title_en || 'Exhibition Moment',
        title_bn: m.title_bn || 'প্রদর্শনীর মুহূর্ত',
        main_image_url: m.url,
        category: 'gallery_media',
        medium_en: 'Photography',
        created_at: m.created_at,
        profiles: null,
        artist_name: 'Gallery Archives',
        target_href: slugOrId ? `/gallery/${slugOrId}` : '/gallery'
      }
    })

    const combined = [...artworksData, ...mediaAsArtworks]
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return combined.slice(0, 8)
  }

  // If no exhibition at all, handle gracefully.
  let artworks: any[] = []
  let artists: any[] = []

  if (exhibition) {
    // 1. Fetch Featured Artists for CURRENT exhibition only
    const artistArtworkRowsRes = await supabase.from('artworks')
      .select(`
        artist_id,
        profiles!artist_id(id, full_name_en, full_name_bn, avatar_url, bio_en, slug, role)
      `)
      .eq('status', 'approved')
      .eq('exhibition_id', exhibition.id)
      .not('artist_id', 'is', null)
      .order('created_at', { ascending: false, nullsFirst: false })

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

    // 2. Fetch Curated Collection with Fallback Priority Logic
    artworks = await fetchCuratedCollection(exhibition.id)

    // Priority 2: If current exhibition has no artworks, locate most recent archived exhibition that DOES
    if (artworks.length === 0) {
      const { data: archivedEx } = await supabase
        .from('exhibitions')
        .select('id')
        .eq('status', 'archived')
        .order('exhibition_start', { ascending: false, nullsFirst: false })
        .limit(5)

      if (archivedEx) {
        for (const arch of archivedEx) {
          const archArtworks = await fetchCuratedCollection(arch.id)
          if (archArtworks.length > 0) {
            artworks = archArtworks
            break
          }
        }
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full">
        {/* 1. Pre-DB CMS Sections */}
        {layout.filter((s) => s.enabled && s.display_order < 2).map((s) => {
          switch (s.section_key) {
            case 'hero': return <HomeHero key="hero" locale={locale} exhibition={exhibition} stats={stats} />
            case 'about': return <HomeAbout key="about" locale={locale} stats={stats} />
            case 'sponsors': return <HomeSponsors key="sponsors" locale={locale} />
            case 'testimonials': return <HomeTestimonials key="testimonials" locale={locale} />
            case 'contactCTA': return <HomeNewsletter key="contactCTA" locale={locale} />
            default: return null
          }
        })}

        {/* 2. Fixed Database Sections */}
        <HomeExhibition locale={locale} exhibition={exhibition} />
        <HomeFeaturedArtists locale={locale} artists={artists} />
        <HomeFeaturedArtworks locale={locale} artworks={artworks} />

        {/* 3. Post-DB CMS Sections */}
        {layout.filter((s) => s.enabled && s.display_order >= 2).map((s) => {
          switch (s.section_key) {
            case 'hero': return <HomeHero key="hero" locale={locale} exhibition={exhibition} stats={stats} />
            case 'about': return <HomeAbout key="about" locale={locale} stats={stats} />
            case 'sponsors': return <HomeSponsors key="sponsors" locale={locale} />
            case 'testimonials': return <HomeTestimonials key="testimonials" locale={locale} />
            case 'contactCTA': return <HomeNewsletter key="contactCTA" locale={locale} />
            default: return null
          }
        })}
      </main>
    </>
  )
}
