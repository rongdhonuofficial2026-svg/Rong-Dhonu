'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { useRef } from "react"

interface HomeExhibitionContentProps {
  locale: string
  currentExhibition: any
  timelineItems: any[]
}

export function HomeExhibitionContent({ locale, currentExhibition, timelineItems }: HomeExhibitionContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])

  if (!currentExhibition) {
    return (
      <section className="relative bg-[#0B0908] overflow-hidden">
        {/* Top transition — already blended from About */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(244,198,98,0.06) 0%, transparent 60%)
            `
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-40 md:py-56">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <p className="text-[10px] tracking-[0.6em] uppercase text-[#F4C662] font-bold flex items-center justify-center gap-5 mb-8">
              <span className="w-16 h-[1px] bg-[#F4C662]/30" />
              {locale === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
              <span className="w-16 h-[1px] bg-[#F4C662]/30" />
            </p>
            <h2 className="font-serif text-[3.5rem] md:text-[6rem] lg:text-[7rem] text-[#F4EEDF] leading-[1.02] font-bold mb-8"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              {locale === 'bn' ? 'পরবর্তী মাস্টারপিস' : 'Curating Our\nNext Masterpiece'}
            </h2>
            <p className="text-[#F4EEDF]/50 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
              {locale === 'bn'
                ? "আমাদের পরবর্তী প্রদর্শনীর জন্য অপেক্ষা করুন।"
                : "Our curators are preparing something extraordinary. Stay tuned for the next chapter."}
            </p>
            <Link href="/exhibitions"
              className="btn btn-gold uppercase tracking-widest font-bold text-[13px] rounded-full mt-14">
              {locale === 'bn' ? 'সকল প্রদর্শনী দেখুন' : 'View All Exhibitions'}
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #EFE6D2)' }} />
      </section>
    )
  }

  const title = locale === 'bn' ? (currentExhibition.theme_bn || currentExhibition.theme_en) : currentExhibition.theme_en
  const venue = locale === 'bn' ? (currentExhibition.venue_bn || currentExhibition.venue_en) : currentExhibition.venue_en
  const startDateStr = currentExhibition.exhibition_start || new Date().toISOString()
  const startDate = new Date(startDateStr)
  const formattedDate = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }).format(startDate)

  return (
    <section ref={ref} className="relative bg-[#0B0908] overflow-hidden">
      {/* Ambient color glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 10% 30%, rgba(244,198,98,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 70%, rgba(244,198,98,0.04) 0%, transparent 55%)
          `
        }}
      />

      {/* === Section header === */}
      <div className="relative z-10 pt-28 md:pt-40 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#F4C662] font-bold flex items-center justify-center gap-5 mb-6">
            <span className="w-16 h-[1px] bg-[#F4C662]/30" />
            {locale === 'bn' ? 'বিশেষ প্রদর্শনী' : 'Featured Exhibition'}
            <span className="w-16 h-[1px] bg-[#F4C662]/30" />
          </p>
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[6.5rem] text-[#F4EEDF] leading-[1.04] font-bold max-w-5xl mx-auto"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
            {title}
          </h2>
        </motion.div>
      </div>

      {/* === Full-bleed cinematic image === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
        className="relative mx-4 md:mx-12 overflow-hidden group border border-white/[0.08]"
        style={{ height: 'clamp(420px, 80vh, 900px)' }}
      >
        {/* Parallax image */}
        <motion.div style={{ y: imgY }} className="absolute inset-0 h-[115%] -top-[7.5%]">
          <PremiumImage
            src={currentExhibition.hero_image_url}
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt={title}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Museum lighting overlays */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to bottom, rgba(11,9,8,0.2) 0%, transparent 40%, transparent 50%, rgba(11,9,8,0.9) 100%),
              linear-gradient(to right, rgba(11,9,8,0.6) 0%, transparent 45%),
              radial-gradient(ellipse at 70% 40%, rgba(244,198,98,0.08) 0%, transparent 50%)
            `
          }}
        />

        {/* Floating information panel — glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
          className="absolute bottom-8 left-4 md:bottom-14 md:left-10 max-w-lg z-10"
        >
          <div className="bg-[#151210]/80 backdrop-blur-xl border border-white/[0.08] border-l-4 border-l-[#F4C662] p-8 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-[#F4EEDF]/80">
                <Calendar className="w-5 h-5 text-[#F4C662] flex-shrink-0" />
                <span className="font-serif text-lg font-light tracking-wide">{formattedDate}</span>
              </div>
              {venue && (
                <div className="flex items-center gap-4 text-[#F4EEDF]/80">
                  <MapPin className="w-5 h-5 text-[#F4C662] flex-shrink-0" />
                  <span className="font-serif text-lg font-light tracking-wide">{venue}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#33CB9C] animate-pulse" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#33CB9C] font-bold">
                {currentExhibition.status === 'ongoing' 
                  ? (locale === 'bn' ? 'বর্তমানে চলছে' : 'Now Open')
                  : (locale === 'bn' ? 'আসছে শীঘ্রই' : 'Opening Soon')}
              </span>
            </div>

            <Link
              href={`/exhibitions/${currentExhibition.id}`}
              className="btn btn-sm btn-gold font-bold text-[12px] uppercase tracking-widest rounded-full px-7 active:scale-[0.97]"
            >
              {locale === 'bn' ? 'প্রদর্শনীতে প্রবেশ করুন' : 'Enter Exhibition'}
            </Link>
          </div>
        </motion.div>

        {/* Year watermark */}
        <div className="absolute top-8 right-8 md:top-14 md:right-14 z-10 pointer-events-none">
          <p className="font-serif text-[8rem] md:text-[12rem] font-bold text-white/[0.03] leading-none select-none">
            {currentExhibition.exhibition_start ? new Date(currentExhibition.exhibition_start).getFullYear() : 2026}
          </p>
        </div>
      </motion.div>

      {/* Bottom seamless transition to cream (artists section) */}
      <div className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0B0908, #EFE6D2)' }}
      />
    </section>
  )
}
