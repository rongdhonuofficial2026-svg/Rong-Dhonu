'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from "framer-motion"
import { PremiumImage } from "@/components/ui/PremiumImage"
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface AboutContentProps {
  content: any
  locale: string
}

export function AboutContent({ content, locale }: AboutContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-background">
      
      {/* Decorative grain and blur */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-overlay canvas-texture" />
      <div className="pointer-events-none absolute top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full bg-accent/5 blur-[120px] mix-blend-multiply" />
      <div className="pointer-events-none absolute bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px] mix-blend-multiply" />

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]">
          <PremiumImage 
            src="/images/placeholders/exhibition.webp"
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt="Museum Interior"
            fill
            priority
            className="object-cover opacity-60"
          />
        </motion.div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-black/40 to-black/20" />
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-6 mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-medium tracking-tight drop-shadow-xl"
          >
            {content.title || (locale === 'bn' ? 'আমাদের সম্পর্কে' : 'Our Story')}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="w-16 h-[1px] bg-white/50 mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto"
          >
            {locale === 'bn' 
              ? 'শিল্প ও শিল্পীর সেতুবন্ধন' 
              : 'A legacy of fine arts, nurturing creativity and preserving heritage since 2010.'}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-32 pb-48 space-y-48">
        
        {/* Mission & Vision Split Layout */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground">
              {locale === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
            </h2>
            <p className="font-serif text-3xl md:text-5xl leading-[1.3] text-foreground font-bold">
              {content.mission || "We aim to create a global stage for local artists to shine."}
            </p>
            <div className="h-[1px] w-16 bg-foreground/20" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Founded on the belief that art has the power to transform society, Rongdhono serves as a bridge between visionary creators and passionate collectors. We curate experiences that challenge perspectives and elevate the contemporary art discourse.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full aspect-[4/5] bg-muted overflow-hidden group shadow-2xl rounded-sm"
          >
            <PremiumImage 
              src="/images/placeholders/artwork-1.webp"
              fallbackSrc="/images/placeholders/artwork-1.webp"
              alt="Mission Artwork"
              fill
              className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
            />
          </motion.div>
        </section>

        {/* Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="order-2 md:order-1 relative w-full aspect-[4/5] bg-muted overflow-hidden group shadow-2xl rounded-sm"
          >
            <PremiumImage 
              src="/images/placeholders/artwork-2.webp"
              fallbackSrc="/images/placeholders/artwork-2.webp"
              alt="Vision Artwork"
              fill
              className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-1 md:order-2 space-y-8 md:pl-12"
          >
            <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground">
              {locale === 'bn' ? 'আমাদের রূপকল্প' : 'Our Vision'}
            </h2>
            <p className="font-serif text-3xl md:text-5xl leading-[1.3] text-foreground font-bold">
              {content.vision || "A world where every stroke of genius finds its rightful audience."}
            </p>
            <div className="h-[1px] w-16 bg-foreground/20" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              We envision a future where cultural heritage and contemporary expression seamlessly intertwine. Through rigorous curation, global partnerships, and a deep commitment to artistic integrity, we are building a lasting sanctuary for fine arts.
            </p>
          </motion.div>
        </section>

        {/* Committee Members (Static Preview for Design) */}
        <section className="space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground">
              {locale === 'bn' ? 'কমিটি মেম্বার' : 'Our Committee'}
            </h2>
            <p className="font-serif text-4xl md:text-5xl text-foreground font-medium">
              {locale === 'bn' ? 'যাদের অবদানে আমরা সমৃদ্ধ' : 'The Visionaries Behind Rongdhono'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative flex flex-col items-center text-center space-y-4"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted shadow-lg rounded-sm mb-4">
                  <PremiumImage
                    src={`/images/placeholders/artist-${i}.webp`}
                    fallbackSrc={`/images/placeholders/artist-${i}.webp`}
                    alt={`Committee Member ${i}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">
                  {locale === 'bn' ? 'শিল্পী নাম' : 'Eminent Artist'}
                </h3>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                  {locale === 'bn' ? 'কমিটি মেম্বার' : 'Board Member'}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legacy & History (Dark Section) */}
        <section className="relative py-32 md:py-48 bg-[#0A0A0A] text-white -mx-6 px-6 overflow-hidden rounded-sm shadow-2xl">
          <div className="absolute inset-0 z-0">
            <PremiumImage 
              src="/images/placeholders/hero.webp"
              fallbackSrc="/images/placeholders/hero.webp"
              alt="History Background"
              fill
              className="object-cover opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-16">
            <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-white/50">
              {locale === 'bn' ? 'ইতিহাস ও ঐতিহ্য' : 'History & Legacy'}
            </h2>
            
            <div className="font-serif text-3xl md:text-5xl leading-tight text-white drop-cap">
              {content.history || "Founded with a passion for fine arts, Rongdhono has grown into a prestigious institution celebrating creativity and heritage."}
            </div>
            
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-4 border-t border-white/20 pt-6">
                <p className="font-serif text-5xl md:text-6xl font-medium text-white/90">2010</p>
                <p className="text-white/50 font-light text-sm uppercase tracking-widest">{locale === 'bn' ? 'প্রতিষ্ঠা' : 'Foundation'}</p>
              </div>
              <div className="space-y-4 border-t border-white/20 pt-6">
                <p className="font-serif text-5xl md:text-6xl font-medium text-white/90">50+</p>
                <p className="text-white/50 font-light text-sm uppercase tracking-widest">{locale === 'bn' ? 'প্রদর্শনী' : 'Major Exhibitions'}</p>
              </div>
              <div className="space-y-4 border-t border-white/20 pt-6">
                <p className="font-serif text-5xl md:text-6xl font-medium text-white/90">2k+</p>
                <p className="text-white/50 font-light text-sm uppercase tracking-widest">{locale === 'bn' ? 'শিল্পী' : 'Global Artists'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 flex flex-col items-center justify-center text-center space-y-10">
          <p className="font-serif text-3xl md:text-5xl text-foreground max-w-3xl leading-tight">
            {locale === 'bn' ? 'আমাদের শিল্পযাত্রায় যোগ দিন' : 'Join our collective journey of artistic discovery.'}
          </p>
          <Link 
            href={`/${locale}/contact`}
            className="group inline-flex items-center gap-4 bg-foreground text-background px-8 py-5 rounded-full hover:bg-foreground/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <span className="text-sm font-medium tracking-widest uppercase">
              {locale === 'bn' ? 'যোগাযোগ করুন' : 'Get in Touch'}
            </span>
            <span className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </section>

      </div>
    </div>
  )
}
