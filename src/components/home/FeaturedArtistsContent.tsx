'use client'

import { motion } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { ArrowUpRight, ArrowRight } from "lucide-react"

export function FeaturedArtistsContent({ locale, artists }: { locale: string, artists: any[] }) {
  const title = locale === 'bn' ? "বিশিষ্ট শিল্পীবৃন্দ" : "Featured Artists"

  return (
    <section className="artists" id="artists">
      <div className="section-head reveal">
        <h2>{title}</h2>
        <p>
          {locale === 'bn'
            ? 'এই বছরের তালিকা থেকে কয়েকটি কণ্ঠস্বর, প্রতিটি বাংলার নিজস্ব শৈল্পিক ঐতিহ্যের একটি পৃথক ধারা বহন করে।'
            : "Voices from this year's roster, each carrying forward a distinct thread of Bengal's visual tradition."}
        </p>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-24 px-6 max-w-2xl mx-auto reveal in">
          <p className="font-serif text-[1.35rem] md:text-2xl text-[#F4EEDF]/60 leading-relaxed italic">
            {locale === 'bn' 
              ? 'এই প্রদর্শনীর জন্য শিল্পীদের নাম শিল্পকর্ম মূল্যায়ন প্রক্রিয়ার পর ঘোষণা করা হবে। অনুগ্রহ করে পরে আবার চেক করুন।' 
              : 'Artist selections for this exhibition will be announced after the artwork review process is complete. Check back soon.'}
          </p>
        </div>
      ) : (
        <div className="artist-row">
          {artists.map((artist, index) => {
            const name = locale === 'bn' ? (artist.full_name_bn || artist.full_name_en) : artist.full_name_en
            const roleLabel = artist.role === 'committee'
              ? (locale === 'bn' ? 'কমিটি সদস্য' : 'Committee Member')
              : (locale === 'bn' ? 'সদস্য শিল্পী' : 'Member Artist')

            const indexStr = `No. 0${index + 1}`

            return (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="artist-card artwork reveal block"
              >
                <img
                  src={artist.avatar_url || "/images/placeholders/artist.webp"}
                  alt={name}
                  loading="lazy"
                />
                <div className="scrim"></div>
                <div className="frame-edge"></div>
                <span className="artist-index">{indexStr}</span>
                <div className="artist-info">
                  <b>{name}</b>
                  <span>{roleLabel}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="artists-cta reveal">
        <Link href="/artists" className="btn btn-line magnetic">
          {locale === 'bn' ? 'সম্পূর্ণ ডিরেক্টরি দেখুন →' : 'View Full Directory →'}
        </Link>
      </div>
    </section>
  )
}

