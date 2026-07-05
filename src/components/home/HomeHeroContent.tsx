'use client'

import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { PremiumImage } from '@/components/ui/PremiumImage'
import { Link } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'

interface HomeHeroContentProps {
  locale: string
  content: any
  exhibition?: any
}

export function HomeHeroContent({ locale, content, exhibition }: HomeHeroContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  const heroImage = content?.imageUrl || exhibition?.hero_image_url
  
  const title = content?.title || (locale === 'bn' ? "সৃজনশীলতা ও ঐতিহ্যের মিলন" : "Where Creativity Meets Legacy")
  const subtitle = content?.subtitle || (locale === 'bn' ? "রংধনু শিল্পী সংঘের বার্ষিক প্রদর্শনী" : "The Annual Exhibition of Rongdhono Artists' Collective")
  const ctaPrimary = content?.ctaPrimary || (locale === 'bn' ? "প্রদর্শনী দেখুন" : "Explore Exhibition")
  const ctaSecondary = content?.ctaSecondary || (locale === 'bn' ? "শিল্পী হন" : "Become an Artist")

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div ref={ref} className="relative w-full h-[100vh] overflow-hidden bg-[#1C1C1E]">
      
      {/* Parallax Background */}
      <motion.div 
        style={{ y, scale }}
        className="absolute inset-0 z-0 w-full h-full"
      >
        <PremiumImage
          src={heroImage}
          fallbackSrc="/images/placeholders/hero.png"
          alt="Exhibition Hero"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Storytelling Overlays: Rich lighting, color grading, and bleed into Cream (#FDFBF7) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#1C1C1E]/60 via-transparent to-[#FDFBF7] pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#D4AF37]/10 to-[#1C1C1E]/80 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

      {/* Floating Particles / Orbs */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="blob absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#D4AF37]/20 blur-[100px] mix-blend-screen" />
        <div className="blob absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#FF7F50]/20 blur-[100px] mix-blend-screen" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center mt-[-5vh]"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
          }}
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.h1 
            variants={textVariants}
            className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-bold text-[#FDFBF7] tracking-tight leading-[1] text-shadow-elegant"
          >
            {title}
          </motion.h1>

          <motion.p 
            variants={textVariants}
            className="mt-8 text-xl md:text-3xl text-white/90 max-w-2xl font-light tracking-wide leading-relaxed text-shadow-elegant"
          >
            {subtitle}
          </motion.p>

          <motion.div 
            variants={textVariants}
            className="mt-14 flex flex-col sm:flex-row items-center gap-6"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-[#D4AF37] text-black hover:bg-[#FDFBF7] transition-all duration-500 hover:scale-105 museum-shadow px-12 py-8 text-sm md:text-base uppercase tracking-[0.2em] font-semibold rounded-none"
            >
              <Link href={exhibition ? `/exhibitions/${exhibition.id}` : "/exhibitions"}>
                {ctaPrimary}
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="glass text-white border-white/40 hover:bg-white hover:text-black transition-all duration-500 hover:scale-105 px-12 py-8 text-sm md:text-base uppercase tracking-[0.2em] font-medium rounded-none"
            >
              <Link href="/about">
                {ctaSecondary}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#1C1C1E]">
          Scroll to explore
        </span>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-8 h-12 border-2 border-[#1C1C1E]/30 rounded-full flex justify-center p-2"
        >
          <div className="w-1.5 h-2.5 bg-[#1C1C1E] rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
