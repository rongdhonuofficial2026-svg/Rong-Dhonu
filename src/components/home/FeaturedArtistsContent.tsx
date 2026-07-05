'use client'

import { motion } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { ArrowUpRight, ArrowRight } from "lucide-react"

export function FeaturedArtistsContent({ locale, artists }: { locale: string, artists: any[] }) {
  const title = locale === 'bn' ? "বিশিষ্ট শিল্পীবৃন্দ" : "Featured Artists"

  return (
    <section className="relative bg-[#FDFBF7] canvas-texture overflow-hidden">
      {/* Top: already has gradient from exhibition dark → cream */}

      {/* Ambient color pools */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full pointer-events-none -translate-y-1/2"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full pointer-events-none translate-y-1/3"
        style={{ background: 'radial-gradient(circle, rgba(120,81,169,0.05) 0%, transparent 70%)' }}
      />

      {/* Decorative paint stroke lines */}
      <div className="absolute top-24 left-0 w-full h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.2) 30%, rgba(212,175,55,0.2) 70%, transparent)' }}
      />

      <div className="relative z-10 max-w-[88rem] mx-auto px-4 md:px-8 py-28 md:py-40">

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
            {locale === 'bn' ? 'স্রষ্টাগণ' : 'The Creators'}
            <span className="w-14 h-[1px] bg-[#D4AF37]/60" />
          </p>
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[6rem] text-[#1C1C1E] font-bold leading-[1.04]">
            {title}
          </h2>
        </motion.div>

        {/* Artist grid */}
        {artists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-24"
          >
            <p className="font-serif text-2xl text-[#1C1C1E]/40 italic">
              {locale === 'bn' ? 'শিল্পীদের প্রোফাইল শীঘ্রই আসছে।' : 'Artist profiles coming soon.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 md:gap-x-12 md:gap-y-20">
            {artists.map((artist, index) => {
              const name = locale === 'bn' ? (artist.full_name_bn || artist.full_name_en) : artist.full_name_en
              const roleLabel = artist.role === 'committee'
                ? (locale === 'bn' ? 'কমিটি সদস্য' : 'Committee Member')
                : (locale === 'bn' ? 'শিল্পী' : 'Artist')

              return (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.9, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Portrait — square card with sophisticated hover */}
                  <Link href={`/artists/${artist.id}`} className="block w-full relative mb-6">
                    {/* Gold glow on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 70%)' }}
                    />

                    <div className="relative w-full aspect-square overflow-hidden bg-[#E8E4DC]"
                      style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.12)' }}>

                      {/* Portrait image */}
                      <PremiumImage
                        src={artist.avatar_url}
                        fallbackSrc="/images/placeholders/artist.png"
                        alt={name}
                        fill
                        className="object-cover object-top transition-transform duration-1000 group-hover:scale-[1.07]"
                      />

                      {/* Warm gradient overlay always present — removed on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/50 via-transparent to-transparent transition-opacity duration-700 group-hover:opacity-60" />

                      {/* Hover overlay with CTA */}
                      <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-bold self-start">
                          {locale === 'bn' ? 'প্রোফাইল দেখুন' : 'View Profile'}
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Gold corner accent */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#D4AF37]/0 group-hover:border-[#D4AF37]/80 transition-all duration-500 z-10" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#D4AF37]/0 group-hover:border-[#D4AF37]/80 transition-all duration-500 z-10" />
                  </Link>

                  {/* Artist info */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl md:text-2xl text-[#1C1C1E] font-bold group-hover:text-[#D4AF37] transition-colors duration-400 leading-tight">
                      <Link href={`/artists/${artist.id}`}>{name}</Link>
                    </h3>
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#1C1C1E]/45 font-bold">{roleLabel}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 md:mt-28 text-center"
        >
          <Link
            href="/artists"
            className="group inline-flex items-center gap-5 text-sm tracking-[0.3em] uppercase font-bold text-[#1C1C1E] hover:text-[#D4AF37] transition-colors duration-400"
          >
            {locale === 'bn' ? 'সম্পূর্ণ ডিরেক্টরি দেখুন' : 'View Full Directory'}
            <span className="relative inline-flex items-center gap-1">
              <span className="w-10 h-[1px] bg-current transition-all duration-400 group-hover:w-16" />
              <ArrowRight className="w-4 h-4 absolute -right-5" />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom: blend to dark artworks section */}
      <div className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #FDFBF7, #111111)' }}
      />
    </section>
  )
}
