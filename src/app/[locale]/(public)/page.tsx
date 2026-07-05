import { HomeHero } from "@/components/home/HomeHero"
import { HomeAbout } from "@/components/home/HomeAbout"
import { HomeFeaturedArtworks } from "@/components/home/FeaturedArtworks"
import { HomeFeaturedArtists } from "@/components/home/FeaturedArtists"
import { HomeExhibition } from "@/components/home/HomeExhibition"
import { HomeStatistics, HomeNewsletter } from "@/components/home/HomeExtras"
import { HomeSponsors, HomeTestimonials } from "@/components/home/HomeSponsors"
import { generateDynamicMetadata, generateOrganizationSchema } from "@/lib/seo"

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col w-full min-h-screen">
        <HomeHero locale={locale} />
        <HomeAbout locale={locale} />
        <HomeExhibition locale={locale} />
        <HomeFeaturedArtworks locale={locale} />
        <HomeFeaturedArtists locale={locale} />
        <HomeStatistics locale={locale} />
        <HomeSponsors locale={locale} />
        <HomeTestimonials locale={locale} />
        <HomeNewsletter locale={locale} />
      </div>
    </>
  )
}
