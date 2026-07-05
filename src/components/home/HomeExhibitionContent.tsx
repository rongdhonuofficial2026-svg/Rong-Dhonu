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
      <section className="relative bg-[#1C1C1E] overflow-hidden">
        {/* Top transition — already blended from About */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 100%, rgba(120,81,169,0.06) 0%, transparent 60%)
            `
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-40 md:py-56">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] tracking-[0.6em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-5 mb-8">
              <span className="w-16 h-[1px] bg-[#D4AF37]/60" />
              {locale === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
              <span className="w-16 h-[1px] bg-[#D4AF37]/60" />
            </p>
            <h2 className="font-serif text-[3.5rem] md:text-[6rem] lg:text-[7rem] text-white leading-[1.02] font-bold mb-8"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
              {locale === 'bn' ? 'পরবর্তী মাস্টারপিস' : 'Curating Our\nNext Masterpiece'}
            </h2>
            <p className="text-white/50 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
              {locale === 'bn'
                ? "আমাদের পরবর্তী প্রদর্শনীর জন্য অপেক্ষা করুন।"
                : "Our curators are preparing something extraordinary. Stay tuned for the next chapter."}
            </p>
            <Link href="/exhibitions"
              className="inline-flex items-center gap-3 mt-14 border border-[#D4AF37]/60 text-[#D4AF37] px-10 py-5 text-xs uppercase tracking-[0.35em] font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-500">
              {locale === 'bn' ? 'সকল প্রদর্শনী দেখুন' : 'View All Exhibitions'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #FDFBF7)' }} />
      </section>
    )
  }

  const title = locale === 'bn' ? (currentExhibition.title_bn || currentExhibition.title_en) : currentExhibition.title_en
  const venue = locale === 'bn' ? (currentExhibition.venue_bn || currentExhibition.venue_en) : currentExhibition.venue_en
  const startDate = new Date(currentExhibition.start_date)
  const formattedDate = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }).format(startDate)

  return (
    <section ref={ref} className="relative bg-[#1C1C1E] overflow-hidden">
      {/* Ambient color glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 10% 30%, rgba(212,175,55,0.07) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 70%, rgba(120,81,169,0.05) 0%, transparent 55%)
          `
        }}
      />

      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* === Section header === */}
      <div className="relative z-10 pt-28 md:pt-40 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-5 mb-6">
            <span className="w-16 h-[1px] bg-[#D4AF37]/60" />
            {locale === 'bn' ? 'বিশেষ প্রদর্শনী' : 'Featured Exhibition'}
            <span className="w-16 h-[1px] bg-[#D4AF37]/60" />
          </p>
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[6.5rem] text-white leading-[1.04] font-bold max-w-5xl mx-auto"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
            {title}
          </h2>
        </motion.div>
      </div>

      {/* === Full-bleed cinematic image === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-2 md:mx-6 overflow-hidden group"
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
              linear-gradient(to bottom, rgba(28,28,30,0.2) 0%, transparent 40%, transparent 50%, rgba(28,28,30,0.9) 100%),
              linear-gradient(to right, rgba(28,28,30,0.65) 0%, transparent 45%),
              radial-gradient(ellipse at 70% 40%, rgba(212,175,55,0.12) 0%, transparent 50%)
            `
          }}
        />

        {/* Floating information panel — glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-8 left-4 md:bottom-14 md:left-10 max-w-lg z-10"
        >
          <div className="bg-[#1C1C1E]/70 backdrop-blur-xl border border-white/10 border-l-4 border-l-[#D4AF37] p-8 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-white/80">
                <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span className="font-serif text-lg font-light tracking-wide">{formattedDate}</span>
              </div>
              {venue && (
                <div className="flex items-center gap-4 text-white/80">
                  <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="font-serif text-lg font-light tracking-wide">{venue}</span>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#50C878] animate-pulse" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#50C878] font-bold">
                {currentExhibition.status === 'active' 
                  ? (locale === 'bn' ? 'বর্তমানে চলছে' : 'Now Open')
                  : (locale === 'bn' ? 'আসছে শীঘ্রই' : 'Opening Soon')}
              </span>
            </div>

            <Link
              href={`/exhibitions/${currentExhibition.id}`}
              className="group inline-flex items-center gap-3 bg-[#D4AF37] text-black px-8 py-4 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all duration-400 hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]"
            >
              {locale === 'bn' ? 'প্রদর্শনীতে প্রবেশ করুন' : 'Enter Exhibition'}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Year watermark */}
        <div className="absolute top-8 right-8 md:top-14 md:right-14 z-10 pointer-events-none">
          <p className="font-serif text-[8rem] md:text-[12rem] font-bold text-white/[0.04] leading-none select-none">
            {new Date(currentExhibition.start_date || Date.now()).getFullYear()}
          </p>
        </div>
      </motion.div>

      {/* Bottom seamless transition to cream (artists section) */}
      <div className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #1C1C1E, #FDFBF7)' }}
      />
    </section>
  )
}
