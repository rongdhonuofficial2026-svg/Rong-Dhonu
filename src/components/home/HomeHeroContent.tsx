'use client'

import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { PremiumImage } from '@/components/ui/PremiumImage'
import { Link } from '@/lib/i18n/routing'
import { useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface HomeHeroContentProps {
  locale: string
  content: any
  exhibition?: any
  stats?: any
}

// Floating particle component
function Particle({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      animate={{
        y: [0, -40, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: 5 + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  )
}

const particles = [
  { x: '10%', y: '20%', size: 4, delay: 0, color: '#F4C662' },
  { x: '85%', y: '15%', size: 3, delay: 1.2, color: 'rgba(244, 238, 223, 0.3)' },
  { x: '70%', y: '70%', size: 5, delay: 0.6, color: '#F4C662' },
  { x: '25%', y: '75%', size: 3, delay: 2, color: 'rgba(244, 238, 223, 0.2)' },
  { x: '92%', y: '55%', size: 4, delay: 1.8, color: '#F4C662' },
  { x: '5%', y: '50%', size: 3, delay: 0.9, color: 'rgba(244, 238, 223, 0.3)' },
  { x: '50%', y: '10%', size: 4, delay: 1.5, color: '#F4C662' },
  { x: '60%', y: '88%', size: 3, delay: 2.5, color: 'rgba(244, 238, 223, 0.2)' },
]

export function HomeHeroContent({ locale, content, exhibition, stats }: HomeHeroContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const heroArtRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroArtRef.current) return
      const px = (e.clientX / window.innerWidth - 0.5) * 20
      const py = (e.clientY / window.innerHeight - 0.5) * 20
      heroArtRef.current.style.transform = `translate(${px}px, ${py}px) scale(1.05)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const heroImage = "/images/home/hero_bg_final.jpg"

  const title = content?.title || (locale === 'bn' 
    ? "যেখানে শিল্প<br>স্পর্শ করে <em>আত্মাকে</em>" 
    : "Where Art<br>Meets <em>Soul</em>")
  const subtitle = content?.subtitle || (locale === 'bn' 
    ? "রংধনু শিল্পী সংঘের বার্ষিক প্রদর্শনী — বর্ধমান ও তার বাইরে থেকে সমসাময়িক খোদাইকৃত শিল্পকর্ম এবং প্রদর্শনীর একটি সমৃদ্ধ সংগ্রহ।" 
    : "A living archive of contemporary Bengali art — original works, working studios, and stories carried forward from Bardhaman and beyond.")

  const totalExhibitions = stats?.totalExhibitions || 14
  const totalArtists = stats?.totalArtists || 340
  const totalArtworks = stats?.totalArtworks || 1200

  return (
    <header ref={ref} className="hero">
      {/* Background artwork */}
      <div
        className="hero-art artwork"
        ref={heroArtRef}
        id="hero-art"
        style={{ transform: 'translate(0px, 0px) scale(1.05)', transition: 'transform 0.1s ease-out' }}
      >
        <img 
          src={heroImage}
          alt="Vibrant multicolored abstract painting" 
          loading="eager"
        />
        <div className="scrim soft"></div>
        <div className="frame-edge"></div>
      </div>

      {/* Brush SVG lines overlay */}
      <svg className="hero-brush" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <path d="M120,780 C420,300 900,260 1500,520" stroke="rgba(244,238,223,.4)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M-40,200 C300,120 620,340 1000,120" stroke="rgba(244,198,98,.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>

      {/* Hero content wrapper */}
      <div className="hero-content">
        <div className="reveal">
          <div className="hero-status">
            <span className="dot"></span> 
            {locale === 'bn' ? '১৪তম বার্ষিক প্রদর্শনী — বর্তমানে উন্মুক্ত' : '14th Annual Exhibition — Now Open'}
          </div>
          {(() => {
            const cleanTitle = title.replace(/<br\s*\/?>/gi, ' ');
            if (locale === 'en' && (cleanTitle.toLowerCase().includes('where art') && cleanTitle.toLowerCase().includes('meets') && cleanTitle.toLowerCase().includes('soul'))) {
              return (
                <h1 style={{ textShadow: '0 6px 40px rgba(0,0,0,.35)' }}>
                  <span className="where-art-meets" style={{ fontFamily: "var(--font-afera), 'Calligraphic Afera Beauty Bold', var(--font-display)", fontWeight: 700 }}>Where Art</span>
                  <br />
                  <span className="where-art-meets" style={{ fontFamily: "var(--font-afera), 'Calligraphic Afera Beauty Bold', var(--font-display)", fontWeight: 700 }}>Meets</span>{' '}
                  <span className="soul" style={{ fontFamily: "var(--font-arsenica), 'Arsenica Medium Italic', var(--font-display)", fontWeight: 500, fontStyle: 'italic', color: 'var(--color-gold-bright)' }}>Soul</span>
                </h1>
              )
            }
            if (locale === 'bn' && (cleanTitle.includes('যেখানে শিল্প') && cleanTitle.includes('স্পর্শ করে') && cleanTitle.includes('আত্মাকে'))) {
              return (
                <h1 style={{ textShadow: '0 6px 40px rgba(0,0,0,.35)' }}>
                  <span className="where-art-meets" style={{ fontFamily: "var(--font-afera), 'Calligraphic Afera Beauty Bold', var(--font-display)", fontWeight: 700 }}>যেখানে শিল্প</span>
                  <br />
                  <span className="where-art-meets" style={{ fontFamily: "var(--font-afera), 'Calligraphic Afera Beauty Bold', var(--font-display)", fontWeight: 700 }}>স্পর্শ করে</span>{' '}
                  <span className="soul" style={{ fontFamily: "var(--font-arsenica), 'Arsenica Medium Italic', var(--font-display)", fontWeight: 500, fontStyle: 'italic', color: 'var(--color-gold-bright)' }}>আত্মাকে</span>
                </h1>
              )
            }
            return <h1 dangerouslySetInnerHTML={{ __html: title }} />
          })()}
        </div>

        <div className="hero-bottom reveal">
          <p className="hero-sub">{subtitle}</p>
          <div className="hero-ctas">
            <Link href="#collection" className="btn btn-gold magnetic">
              {locale === 'bn' ? "গ্যালারি দেখুন" : "View Gallery"}
            </Link>
            <Link href="/exhibitions" className="btn btn-line magnetic">
              {locale === 'bn' ? "প্রদর্শনী অনুসন্ধান →" : "Explore Exhibitions →"}
            </Link>
          </div>
          
          <div className="hero-stats-inline">
            <div>
              <b>{totalExhibitions}+</b>
              <span>{locale === 'bn' ? 'প্রদর্শনী' : 'Exhibitions'}</span>
            </div>
            <div>
              <b>{totalArtists}+</b>
              <span>{locale === 'bn' ? 'শিল্পী' : 'Artists'}</span>
            </div>
            <div>
              <b>{totalArtworks >= 1000 ? `${(totalArtworks / 1000).toFixed(1)}K` : totalArtworks}+</b>
              <span>{locale === 'bn' ? 'পৃষ্ঠপোষক' : 'Patrons'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span>{locale === 'bn' ? 'স্ক্রোল করুন' : 'Scroll'}</span>
        <span className="line"></span>
      </div>
    </header>
  )
}
