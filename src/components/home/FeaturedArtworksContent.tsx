import { motion } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeaturedArtworksContentProps {
  locale: string
  displayData: any[]
  hasData: boolean
}

export function FeaturedArtworksContent({ locale, displayData, hasData }: FeaturedArtworksContentProps) {
  const title = locale === 'bn' ? "প্রদর্শিত সংগ্রহ" : "Curated Collection"
  const subtitle = locale === 'bn'
    ? "আমাদের সর্বশেষ সংগ্রহ থেকে বিশেষভাবে নির্বাচিত শিল্পকর্ম"
    : "A hand-picked selection from our most celebrated exhibition catalogue."

  if (displayData.length === 0) {
    return (
      <section className="collection" id="collection">
        <div className="section-head reveal">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="text-center py-24">
          <p className="font-serif text-2xl text-white/40 italic">
            {locale === 'bn' ? 'কিউরেটররা পরবর্তী সংগ্রহ প্রস্তুত করছেন।' : 'Our curators are preparing the next collection.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="collection" id="collection">
      <div className="section-head reveal">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="bento">
        {displayData.slice(0, 6).map((artwork: any, index: number) => {
          const artworkTitle = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
          const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
          const artistName = hasData
            ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
            : artwork.artist_name
          const year = artwork.year || (artwork.created_at ? new Date(artwork.created_at).getFullYear() : 2026)
          
          const fallbackIdx = (index % 3) + 1
          const imgUrl = artwork.main_image_url || `/images/home/artwork_${fallbackIdx}.jpg`
          const artworkNo = `No. 0${index + 1}`

          return (
            <Link
              key={artwork.id}
              href={`/gallery/artwork/${artwork.id}`}
              className="bento-tile artwork reveal block"
            >
              <img
                src={imgUrl}
                alt={artworkTitle}
                loading="lazy"
              />
              <div className="scrim"></div>
              <div className="frame-edge"></div>
              <div className="wall-label">
                <span className="no">{artworkNo}</span>
                <b>{artworkTitle}</b>
                <span>{artistName} — {medium}, {year}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="collection-cta reveal">
        <Link href="/gallery" className="btn btn-line magnetic">
          {locale === 'bn' ? 'সম্পূর্ণ গ্যালারি দেখুন →' : 'Explore Full Collection →'}
        </Link>
      </div>
    </section>
  )
}

