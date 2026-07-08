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
      
      {/* Watermark year */}
      <div className="spotlight-bgtext">{yearSuffix}</div>
      
      <div className="spotlight-inner">
        <div className="eyebrow reveal in">
          {locale === 'bn' ? 'বিশেষ প্রদর্শনী' : 'Featured Exhibition'}
        </div>
        
        <h2 className="reveal in">
          {title} <em>— {locale === 'bn' ? 'রঙের উৎসব' : 'A Festival of Colour'}</em>
        </h2>
        
        <p className="spotlight-sub reveal in">
          {locale === 'bn' 
            ? "একটি যুগান্তকারী শিল্প প্রদর্শনী যা বারোটি স্টুডিও, ষাটটি নতুন কাজ এবং বাংলার সবচেয়ে বিশিষ্ট শিল্পীদের একত্রিত করে।" 
            : "A season-defining showcase bringing together fourteen studios, sixty new works, and a decade of Bengal's most distinctive visual voices."}
        </p>
        
        <div className="spotlight-card reveal in">
          {/* Detail: Date */}
          <div className="spotlight-detail">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <b>{formattedDate}</b>
              <span>{locale === 'bn' ? 'উদ্বোধনী রাত, সন্ধ্যা ৬টা থেকে' : 'Opening Night, 6 PM onward'}</span>
            </div>
          </div>

          {/* Detail: Venue */}
          {venue && (
            <div className="spotlight-detail">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <div>
                <b>{venue}</b>
                <span>{locale === 'bn' ? 'বর্ধমান, পশ্চিমবঙ্গ' : 'Bardhaman, West Bengal'}</span>
              </div>
            </div>
          )}

          {/* Status Tag */}
          <span className="spotlight-tag">
            {currentExhibition.status === 'ongoing' 
              ? (locale === 'bn' ? 'বর্তমানে চলছে' : 'Now Open')
              : (locale === 'bn' ? 'আসছে শীঘ্রই' : 'Opening Soon')}
          </span>

          <Link href={`/exhibitions/${currentExhibition.id}`} className="btn btn-ink btn-sm magnetic md:ml-auto">
            {locale === 'bn' ? 'প্রদর্শনীতে প্রবেশ করুন →' : 'Enter Exhibition →'}
          </Link>
        </div>
      </div>
    </section>
  )
}
