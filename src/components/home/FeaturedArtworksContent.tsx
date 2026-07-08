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
      <section className="relative bg-[#0B0908] py-40 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(244,198,98,0.06) 0%, transparent 60%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-xl mx-auto px-6"
        >
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#F4C662] font-bold mb-6">
            {locale === 'bn' ? 'সংগ্রহ' : 'The Collection'}
          </p>
          <h2 className="font-serif text-5xl text-white font-bold mb-6">{title}</h2>
          <p className="text-white/40 font-serif italic text-xl">
            {locale === 'bn' ? 'কিউরেটররা পরবর্তী সংগ্রহ প্রস্তুত করছেন।' : 'Our curators are preparing the next collection.'}
          </p>
        </motion.div>
        <div className="h-32 pointer-events-none absolute bottom-0 left-0 right-0"
          style={{ background: 'linear-gradient(to bottom, transparent, #EFE6D2)' }} />
      </section>
    )
  }

  return (
    <section className="relative bg-[#0B0908] overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(244,198,98,0.04) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,198,98,0.03) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-12 pt-24 md:pt-40 pb-20 md:pb-32">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="text-center mb-20 md:mb-28"
        >
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#F4C662] font-bold flex items-center justify-center gap-5 mb-6">
            <span className="w-14 h-[1px] bg-[#F4C662]/30" />
            {locale === 'bn' ? 'বিশেষ সংগ্রহ' : 'The Collection'}
            <span className="w-14 h-[1px] bg-[#F4C662]/30" />
          </p>
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[6rem] text-white font-bold leading-[1.04]"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
            {title}
          </h2>
          <p className="mt-5 text-[#F4EEDF]/45 text-base md:text-lg font-light max-w-xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
          {displayData.slice(0, 6).map((artwork: any, index: number) => {
            const artworkTitle = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
            const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
            const artistName = hasData
              ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
              : artwork.artist_name
            const year = artwork.year || (artwork.created_at ? new Date(artwork.created_at).getFullYear() : 2026)
            const fallbackIdx = (index % 6) + 1

            // Determine bento column and row spans
            let bentoSpan = "md:col-span-1 md:row-span-1"
            if (index === 0) {
              bentoSpan = "md:col-span-2 md:row-span-2"
            } else if (index === 2) {
              bentoSpan = "md:col-span-1 md:row-span-2"
            } else if (index === 4) {
              bentoSpan = "md:col-span-2 md:row-span-1"
            }

            return (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.9, delay: (index % 3) * 0.12, ease: [0.19, 1, 0.22, 1] }}
                className={cn("group relative block overflow-hidden rounded-none", bentoSpan)}
                style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)' }}
              >
                <Link
                  href={`/gallery/artwork/${artwork.id}`}
                  className="artwork block relative h-full w-full group"
                >
                  <PremiumImage
                    src={artwork.main_image_url}
                    fallbackSrc={`/images/placeholders/artwork-${fallbackIdx}.webp`}
                    alt={artworkTitle}
                    fill
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  />

                  {/* Scrim Overlay */}
                  <div className="scrim" />
                  
                  {/* Digital frame border line */}
                  <div className="frame-edge" />

                  {/* Hover reveal overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none">
                    <div className="p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <h4 className="font-serif text-xl md:text-2xl text-white font-bold leading-tight mb-2">{artworkTitle}</h4>
                      <div className="w-8 h-[1px] bg-[#F4C662] mb-3" />
                      <p className="text-white/70 text-xs uppercase tracking-[0.3em] font-medium mb-1">{artistName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {medium && <span className="text-white/40 text-xs uppercase tracking-widest">{medium}</span>}
                        {year && <><span className="text-white/25">·</span><span className="text-white/40 text-xs">{year}</span></>}
                      </div>
                    </div>
                  </div>

                  {/* Permanent gold corner accents on hover */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#F4C662]/0 group-hover:border-[#F4C662]/80 transition-all duration-500 z-10" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#F4C662]/0 group-hover:border-[#F4C662]/80 transition-all duration-500 z-10" />
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
            className="btn btn-line uppercase tracking-widest font-bold text-[13px] rounded-full active:scale-[0.97]"
          >
            {locale === 'bn' ? 'সম্পূর্ণ গ্যালারি' : 'Explore Full Collection'}
          </Link>
        </motion.div>
      </div>

      {/* Bottom: cream transition for testimonials */}
      <div className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0B0908, #0B0908)' }}
      />
    </section>
  )
}
