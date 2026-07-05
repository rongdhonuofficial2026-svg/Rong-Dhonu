import { HomeHero } from "@/components/home/HomeHero"
import { HomeAbout } from "@/components/home/HomeAbout"
import { HomeFeaturedArtworks } from "@/components/home/FeaturedArtworks"
import { HomeFeaturedArtists } from "@/components/home/FeaturedArtists"
import { HomeExhibition } from "@/components/home/HomeExhibition"
import { HomeStatistics, HomeNewsletter } from "@/components/home/HomeExtras"
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

  // Fetch data safely without throwing errors to ensure the homepage always renders
  const [exhibitionsRes, artworksRes, artistsRes, countsRes] = await Promise.all([
    supabase.from('exhibitions').select('*').in('status', ['active', 'upcoming']).order('start_date', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('artworks').select('*, profiles(full_name_en, full_name_bn)').eq('status', 'approved').limit(8),
    supabase.from('profiles').select('*').in('role', ['member', 'committee']).limit(6),
    supabase.rpc('get_homepage_stats').maybeSingle() // Optional: if we have an RPC, else we'll fallback
  ])

  const exhibition = exhibitionsRes.data
  const artworks = artworksRes.data || []
  const artists = artistsRes.data || []
  const stats = countsRes.data || null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col w-full min-h-screen bg-background">
        <HomeHero locale={locale} exhibition={exhibition} />
        <HomeAbout locale={locale} />
        <HomeExhibition locale={locale} exhibition={exhibition} />
        <HomeFeaturedArtists locale={locale} artists={artists} />
        <HomeFeaturedArtworks locale={locale} artworks={artworks} />
        <HomeStatistics locale={locale} stats={stats} />
        <HomeTestimonials locale={locale} />
        <HomeSponsors locale={locale} />
        <HomeNewsletter locale={locale} />
      </div>
    </>
  )
}
