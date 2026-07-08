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
    <div ref={containerRef} className="relative w-full overflow-hidden bg-[#EFE6D2] text-[#1E1A16]">
      
      {/* Ambient color and blur */}
      <div className="pointer-events-none absolute top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full bg-[#F4C662]/5 blur-[120px] mix-blend-multiply" />
      <div className="pointer-events-none absolute bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-[#B4233A]/5 blur-[120px] mix-blend-multiply" />

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#0B0908]">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]">
          <PremiumImage 
            src="/images/placeholders/exhibition.webp"
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt="Museum Interior"
            fill
            priority
            className="object-cover opacity-50"
          />
        </motion.div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0908] via-transparent to-black/30" />
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto space-y-6 mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F4EEDF] font-bold tracking-tight drop-shadow-xl"
          >
            {content.title || (locale === 'bn' ? 'আমাদের সম্পর্কে' : 'Our Story')}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="w-16 h-[1.5px] bg-[#F4C662]/50 mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-2xl text-[#F4EEDF]/90 font-light leading-relaxed max-w-2xl mx-auto"
          >
            {locale === 'bn' 
              ? 'শিল্প ও শিল্পীর সেতুবন্ধন' 
              : 'A legacy of fine arts, nurturing creativity and preserving heritage since 2010.'}
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10 pt-32 pb-48 space-y-48">
        
        {/* Mission & Vision Split Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="space-y-8"
          >
            <h2 className="eyebrow on-paper">
              {locale === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
            </h2>
            <p className="font-serif text-3xl md:text-5xl leading-[1.1] text-[#1E1A16] font-bold">
              {content.mission || "We aim to create a global stage for local artists to shine."}
            </p>
            <div className="h-[1px] w-16 bg-[#DCCFAE]" />
            <p className="text-[#5C5347] text-lg leading-relaxed">
              Founded on the belief that art has the power to transform society, Rongdhono serves as a bridge between visionary creators and passionate collectors. We curate experiences that challenge perspectives and elevate the contemporary art discourse.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="relative w-full aspect-[4/5] bg-[#DCCFAE]/20 overflow-hidden group shadow-2xl border border-[#DCCFAE]"
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
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="order-2 lg:order-1 relative w-full aspect-[4/5] bg-[#DCCFAE]/20 overflow-hidden group shadow-2xl border border-[#DCCFAE]"
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
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="order-1 lg:order-2 space-y-8 lg:pl-12"
          >
            <h2 className="eyebrow on-paper">
              {locale === 'bn' ? 'আমাদের রূপকল্প' : 'Our Vision'}
            </h2>
            <p className="font-serif text-3xl md:text-5xl leading-[1.1] text-[#1E1A16] font-bold">
              {content.vision || "A world where every stroke of genius finds its rightful audience."}
            </p>
            <div className="h-[1px] w-16 bg-[#DCCFAE]" />
            <p className="text-[#5C5347] text-lg leading-relaxed">
              We envision a future where cultural heritage and contemporary expression seamlessly intertwine. Through rigorous curation, global partnerships, and a deep commitment to artistic integrity, we are building a lasting sanctuary for fine arts.
            </p>
          </motion.div>
        </section>

        {/* Committee Members (Static Preview for Design) */}
        <section className="space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="eyebrow on-paper flex justify-center">
              {locale === 'bn' ? 'কমিটি মেম্বার' : 'Our Committee'}
            </h2>
            <p className="font-serif text-4xl md:text-5xl text-[#1E1A16] font-bold">
              {locale === 'bn' ? 'যাদের অবদানে আমরা সমৃদ্ধ' : 'The Visionaries Behind Rongdhono'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
                className="group relative flex flex-col items-center text-center space-y-4 bg-[#F4EEDF] border border-[#DCCFAE] p-5 pb-8"
                style={{ boxShadow: '0 20px 50px -10px rgba(30,26,22,0.06)' }}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#DCCFAE]/20 border border-[#DCCFAE] mb-2">
                  <PremiumImage
                    src={`/images/placeholders/artist-${i}.webp`}
                    fallbackSrc={`/images/placeholders/artist-${i}.webp`}
                    alt={`Committee Member ${i}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-[#B4233A]/5 transition-colors duration-500" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1E1A16] group-hover:text-[#B4233A] transition-colors leading-tight">
                  {locale === 'bn' ? 'শিল্পী নাম' : 'Eminent Artist'}
                </h3>
                <p className="text-[10px] tracking-widest text-[#B4233A] uppercase font-bold">
                  {locale === 'bn' ? 'কমিটি মেম্বার' : 'Board Member'}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legacy & History (Dark Section) */}
        <section className="relative py-32 md:py-48 bg-[#151210] text-[#F4EEDF] -mx-6 px-6 overflow-hidden border border-white/[0.08] shadow-2xl">
          <div className="absolute inset-0 z-0">
            <PremiumImage 
              src="/images/placeholders/hero.webp"
              fallbackSrc="/images/placeholders/hero.webp"
              alt="History Background"
              fill
              className="object-cover opacity-20 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#151210] via-transparent to-[#151210]" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-16">
            <h2 className="eyebrow flex justify-center">
              {locale === 'bn' ? 'ইতিহাস ও ঐতিহ্য' : 'History & Legacy'}
            </h2>
            
            <div className="font-serif text-3xl md:text-5xl leading-relaxed text-[#F4EEDF] font-bold">
              {content.history || "Founded with a passion for fine arts, Rongdhono has grown into a prestigious institution celebrating creativity and heritage."}
            </div>
            
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="font-serif text-5xl md:text-6xl font-bold text-[#F4C662]">2010</p>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">{locale === 'bn' ? 'প্রতিষ্ঠা' : 'Foundation'}</p>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="font-serif text-5xl md:text-6xl font-bold text-[#F4C662]">50+</p>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">{locale === 'bn' ? 'প্রদর্শনী' : 'Major Exhibitions'}</p>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="font-serif text-5xl md:text-6xl font-bold text-[#F4C662]">2k+</p>
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">{locale === 'bn' ? 'শিল্পী' : 'Global Artists'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 flex flex-col items-center justify-center text-center space-y-10">
          <p className="font-serif text-3xl md:text-5xl text-[#1E1A16] max-w-3xl leading-snug font-bold">
            {locale === 'bn' ? 'আমাদের শিল্পযাত্রায় যোগ দিন' : 'Join our collective journey of artistic discovery.'}
          </p>
          <Link 
            href={`/${locale}/contact`}
            className="btn btn-paper uppercase tracking-widest font-bold text-[13px] rounded-full active:scale-[0.97]"
          >
            {locale === 'bn' ? 'যোগাযোগ করুন' : 'Get in Touch'}
          </Link>
        </section>

      </div>
    </div>
  )
}
