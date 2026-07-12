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

  const yearSuffix = currentExhibition.year ? String(currentExhibition.year).slice(-2) : '26'
  const spotlightImage = currentExhibition.hero_image_url || "/images/home/spotlight_bg.jpg"

  return (
    <section ref={ref} className="spotlight artwork" id="exhibition">
      {/* Background artwork */}
      <img 
        src={spotlightImage} 
        alt={title} 
        loading="lazy" 
      />
      <div className="scrim"></div>
      <div className="frame-edge"></div>
      
      {/* Watermark year */}
      <div className="spotlight-bgtext">{yearSuffix}</div>
      
      <div className="spotlight-inner">
        <div className="eyebrow reveal">
          {locale === 'bn' ? 'বিশেষ প্রদর্শনী' : 'Featured Exhibition'}
        </div>
        
        <h2 className="reveal">
          {title}
        </h2>
        
        <p className="spotlight-sub reveal">
          {locale === 'bn' 
            ? (currentExhibition.description_bn || currentExhibition.curatorial_statement_bn || currentExhibition.description_en || '')
            : (currentExhibition.description_en || currentExhibition.curatorial_statement_en || '')}
        </p>
        
        <div className="spotlight-card reveal !flex-col md:!flex-row md:!items-center gap-6">
          <div className="flex-1 w-full flex flex-col gap-3">
            {timelineItems.map((item, index) => (
              <div key={item.id} className={`flex justify-between items-center text-sm pb-3 ${index !== timelineItems.length - 1 ? 'border-b border-white/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'current' ? 'bg-[#F4C662] shadow-[0_0_8px_rgba(244,198,98,0.6)]' : item.status === 'completed' ? 'bg-green-500/80' : 'bg-white/20'}`} />
                  <span className="text-[#F4EEDF] font-medium">{item.title}</span>
                </div>
                <span className="text-white/60 font-medium">{item.date}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 min-w-[200px] shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
             <span className="spotlight-tag mx-0 w-fit self-start md:self-auto">
               {currentExhibition.status === 'ongoing' 
                 ? (locale === 'bn' ? 'বর্তমানে চলছে' : 'Now Open')
                 : currentExhibition.status === 'upcoming' 
                   ? (locale === 'bn' ? 'আসছে শীঘ্রই' : 'Opening Soon')
                   : (locale === 'bn' ? 'সমাপ্ত' : 'Archived')}
             </span>

             <Link href={`/exhibitions/${currentExhibition.id}`} className="btn btn-ink btn-sm magnetic justify-center w-full">
               {locale === 'bn' ? 'প্রদর্শনীতে প্রবেশ করুন →' : 'Enter Exhibition →'}
             </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
