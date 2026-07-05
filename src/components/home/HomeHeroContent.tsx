'use client'

import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import Image from 'next/image'
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
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Fallback museum image if no exhibition or content image
  const defaultImage = "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2500"
  const heroImage = content?.imageUrl || exhibition?.hero_image_url || defaultImage
  
  const title = content?.title || (locale === 'bn' ? "সৃজনশীলতা ও ঐতিহ্যের মিলন" : "Where Creativity Meets Legacy")
  const subtitle = content?.subtitle || (locale === 'bn' ? "রংধনু শিল্পী সংঘের বার্ষিক প্রদর্শনী" : "The Annual Exhibition of Rongdhono Artists' Collective")
  const ctaPrimary = content?.ctaPrimary || (locale === 'bn' ? "প্রদর্শনী দেখুন" : "Explore Exhibition")
  const ctaSecondary = content?.ctaSecondary || (locale === 'bn' ? "শিল্পী হন" : "Become an Artist")

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div ref={ref} className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-[#111111]">
      
      {/* Parallax Background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0 w-full h-full"
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <Image
            src={heroImage}
            alt="Hero Background"
            fill
            priority
            quality={90}
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-[#111111] pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-overlay pointer-events-none" />

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center"
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
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-[#FDFBF7] tracking-tight leading-[1.05] drop-shadow-2xl"
          >
            {title}
          </motion.h1>

          <motion.p 
            variants={textVariants}
            className="mt-8 text-lg md:text-2xl text-white/80 max-w-2xl font-light tracking-wide leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div 
            variants={textVariants}
            className="mt-12 flex flex-col sm:flex-row items-center gap-6"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-[#D4AF37] text-black hover:bg-[#FDFBF7] transition-colors duration-300 px-10 py-7 text-sm md:text-base uppercase tracking-[0.2em] font-medium rounded-none"
            >
              <Link href={exhibition ? `/exhibitions/${exhibition.id}` : "/exhibitions"}>
                {ctaPrimary}
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="bg-transparent text-white border-white/30 hover:bg-white hover:text-black transition-colors duration-300 px-10 py-7 text-sm md:text-base uppercase tracking-[0.2em] font-medium rounded-none backdrop-blur-sm"
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-white/50">
          Scroll to explore
        </span>
        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-8 h-12 border border-white/20 rounded-full flex justify-center p-2"
        >
          <div className="w-1 h-2 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
