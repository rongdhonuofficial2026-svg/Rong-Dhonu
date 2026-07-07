import { HomeHero } from "@/components/home/HomeHero"
import { HomeAbout } from "@/components/home/HomeAbout"
import { HomeFeaturedArtworks } from "@/components/home/FeaturedArtworks"
import { HomeFeaturedArtists } from "@/components/home/FeaturedArtists"
import { HomeExhibition } from "@/components/home/HomeExhibition"
import { HomeNewsletter } from "@/components/home/HomeExtras"
import { HomeSponsors, HomeTestimonials } from "@/components/home/HomeSponsors"
import { generateDynamicMetadata, generateOrganizationSchema } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return generateDynamicMetadata({
    title: locale === 'bn' ? "হোম" : "Home",
    description:
      locale === 'bn'
        ? "রংধনু শিল্পী সংঘের অফিসিয়াল ওয়েবসাইট এবং ডিজিটাল মিউজিয়াম।"
        : "The official website and digital museum of the Rongdhono artists' collective.",
    url: '/',
    locale,
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

  // If no exhibition at all, handle gracefully.
  let artworks = []
  let artists = []
  let stats = null

  if (exhibition) {
    const [artworksRes, artistsRes, countsRes] = await Promise.all([
      // Artworks from this specific exhibition
      supabase.from('artworks')
        .select('*, profiles(full_name_en, full_name_bn)')
        .eq('status', 'approved')
        .eq('exhibition_id', exhibition.id)
        .limit(8),
      
      // Approved participants for this specific exhibition
      supabase.from('exhibition_participants')
        .select('*, profiles(*)')
        .eq('status', 'approved')
        .eq('exhibition_id', exhibition.id)
        .limit(6),
        
      supabase.rpc('get_homepage_stats').maybeSingle() // Optional
    ])

    artworks = artworksRes.data || []
    
    // Map participants to their profile objects
    if (artistsRes.data) {
      artists = artistsRes.data.map(p => p.profiles).filter(Boolean)
    }
    
    stats = countsRes.data || null
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full">
        <HomeHero locale={locale} exhibition={exhibition} />
        <HomeAbout locale={locale} />
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
