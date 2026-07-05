'use client'

import { motion } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { ArrowRight } from "lucide-react"

interface FeaturedArtworksContentProps {
  locale: string
  displayData: any[]
  hasData: boolean
}

// Heights for visual interest — alternating tall/short
const HEIGHT_PATTERN = ['h-[540px]', 'h-[380px]', 'h-[460px]', 'h-[420px]', 'h-[580px]', 'h-[360px]', 'h-[500px]', 'h-[400px]']

export function FeaturedArtworksContent({ locale, displayData, hasData }: FeaturedArtworksContentProps) {
  const title = locale === 'bn' ? "প্রদর্শিত সংগ্রহ" : "Curated Collection"
  const subtitle = locale === 'bn'
    ? "আমাদের সর্বশেষ সংগ্রহ থেকে বিশেষভাবে নির্বাচিত শিল্পকর্ম"
    : "A hand-picked selection from our most celebrated exhibition catalogue."

  if (displayData.length === 0) {
    return (
      <section className="relative bg-[#111111] py-40 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 60%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-xl mx-auto px-4"
        >
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#D4AF37] font-bold mb-6">
            {locale === 'bn' ? 'সংগ্রহ' : 'The Collection'}
          </p>
          <h2 className="font-serif text-5xl text-white font-bold mb-6">{title}</h2>
          <p className="text-white/40 font-serif italic text-xl">
            {locale === 'bn' ? 'কিউরেটররা পরবর্তী সংগ্রহ প্রস্তুত করছেন।' : 'Our curators are preparing the next collection.'}
          </p>
        </motion.div>
        <div className="h-32 pointer-events-none absolute bottom-0 left-0 right-0"
          style={{ background: 'linear-gradient(to bottom, transparent, #FDFBF7)' }} />
      </section>
    )
  }

  return (
    <section className="relative bg-[#111111] overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,81,169,0.05) 0%, transparent 70%)' }}
      />

      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      <div className="relative z-10 max-w-[100rem] mx-auto px-3 md:px-6 pt-24 md:pt-40 pb-20 md:pb-32">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 md:mb-28"
        >
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-5 mb-6">
            <span className="w-14 h-[1px] bg-[#D4AF37]/60" />
            {locale === 'bn' ? 'বিশেষ সংগ্রহ' : 'The Collection'}
            <span className="w-14 h-[1px] bg-[#D4AF37]/60" />
          </p>
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[6rem] text-white font-bold leading-[1.04]"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
            {title}
          </h2>
          <p className="mt-5 text-white/45 text-base md:text-lg font-light max-w-xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Masonry-style artwork grid using CSS columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5">
          {displayData.map((artwork: any, index: number) => {
            const artworkTitle = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
            const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
            const artistName = hasData
              ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
              : artwork.artist_name
            const year = artwork.year || (artwork.created_at ? new Date(artwork.created_at).getFullYear() : 2026)
            const heightClass = HEIGHT_PATTERN[index % HEIGHT_PATTERN.length]
            const fallbackIdx = (index % 6) + 1

            return (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.9, delay: (index % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="break-inside-avoid mb-4 md:mb-5"
              >
                <Link
                  href={`/gallery/artwork/${artwork.id}`}
                  className="group block relative overflow-hidden bg-[#1C1C1E]"
                  style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)' }}
                >
                  {/* Artwork image */}
                  <div className={`relative w-full ${heightClass}`}>
                    <PremiumImage
                      src={artwork.main_image_url}
                      fallbackSrc={`/images/placeholders/artwork-${fallbackIdx}.webp`}
                      alt={artworkTitle}
                      fill
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                    />
                  </div>

                  {/* Hover reveal overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-600 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)' }}
                  >
                    <div className="p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-600 ease-out">
                      <h4 className="font-serif text-xl md:text-2xl text-white font-bold leading-tight mb-2">{artworkTitle}</h4>
                      <div className="w-8 h-[1px] bg-[#D4AF37] mb-3" />
                      <p className="text-white/70 text-xs uppercase tracking-[0.3em] font-medium mb-1">{artistName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {medium && <span className="text-white/40 text-xs uppercase tracking-widest">{medium}</span>}
                        {year && <><span className="text-white/25">·</span><span className="text-white/40 text-xs">{year}</span></>}
                      </div>
                    </div>
                  </div>

                  {/* Permanent gold corner accent visible always */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-0 border-l-0 border-[#D4AF37]/0 group-hover:border-t-[3px] group-hover:border-l-[3px] group-hover:border-[#D4AF37]/80 transition-all duration-500 w-8 h-8" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* View full collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 md:mt-24 text-center"
        >
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-5 border border-white/20 text-white px-12 py-5 text-xs uppercase tracking-[0.35em] font-bold hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all duration-500"
          >
            {locale === 'bn' ? 'সম্পূর্ণ গ্যালারি' : 'Explore Full Collection'}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* Bottom: cream transition for testimonials */}
      <div className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #111111, #FDFBF7)' }}
      />
    </section>
  )
}
