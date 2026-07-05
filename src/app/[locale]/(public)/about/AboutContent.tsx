'use client'

import { motion, Variants } from "framer-motion"
import Image from "next/image"

interface AboutContentProps {
  content: any
  locale: string
}

export function AboutContent({ content, locale }: AboutContentProps) {
  
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  }

  return (
    <div className="space-y-32 md:space-y-48">
      
      {/* Mission & Vision Split Layout */}
      <motion.section 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center"
      >
        <motion.div variants={item} className="space-y-8">
          <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground">
            {locale === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
          </h2>
          <p className="font-serif text-3xl md:text-5xl leading-[1.3] text-foreground font-bold">
            {content.mission || "We aim to create a global stage for local artists to shine."}
          </p>
          <div className="h-[1px] w-16 bg-foreground/20" />
        </motion.div>
        
        <motion.div variants={item} className="relative aspect-square md:aspect-[4/5] bg-muted overflow-hidden group">
          <Image 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200"
            alt="Art Gallery Mission"
            fill
            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
          />
        </motion.div>
      </motion.section>

      <motion.section 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center"
      >
        <motion.div variants={item} className="order-2 md:order-1 relative aspect-video md:aspect-[4/5] bg-muted overflow-hidden group">
          <Image 
            src="https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=1200"
            alt="Art Gallery Vision"
            fill
            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
          />
        </motion.div>
        
        <motion.div variants={item} className="order-1 md:order-2 space-y-8 md:pl-12">
          <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground">
            {locale === 'bn' ? 'আমাদের রূপকল্প' : 'Our Vision'}
          </h2>
          <p className="font-serif text-3xl md:text-5xl leading-[1.3] text-foreground font-bold">
            {content.vision || "A world where every stroke of genius finds its rightful audience."}
          </p>
          <div className="h-[1px] w-16 bg-foreground/20" />
        </motion.div>
      </motion.section>

      {/* History & Legacy */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative py-32 md:py-48 bg-[#1A1A1A] text-white -mx-6 md:-mx-12 px-6 md:px-12 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1582561424760-0321d6837943?auto=format&fit=crop&q=80&w=2000"
            alt="History Background"
            fill
            className="object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-transparent to-[#1A1A1A]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-white/50">
            {locale === 'bn' ? 'ইতিহাস ও ঐতিহ্য' : 'History & Legacy'}
          </h2>
          
          <div className="font-serif text-2xl md:text-4xl leading-relaxed text-white/90 drop-cap text-left md:text-center">
            {content.history || "Founded with a passion for fine arts, Rongdhono has grown into a prestigious institution celebrating creativity and heritage."}
          </div>
          
          <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4 border-t border-white/20 pt-6">
              <p className="font-serif text-4xl font-bold text-white">2010</p>
              <p className="text-white/60 font-light text-sm uppercase tracking-widest">{locale === 'bn' ? 'প্রতিষ্ঠা' : 'Foundation'}</p>
            </div>
            <div className="space-y-4 border-t border-white/20 pt-6">
              <p className="font-serif text-4xl font-bold text-white">50+</p>
              <p className="text-white/60 font-light text-sm uppercase tracking-widest">{locale === 'bn' ? 'প্রদর্শনী' : 'Exhibitions'}</p>
            </div>
            <div className="space-y-4 border-t border-white/20 pt-6">
              <p className="font-serif text-4xl font-bold text-white">2k+</p>
              <p className="text-white/60 font-light text-sm uppercase tracking-widest">{locale === 'bn' ? 'শিল্পী' : 'Artists Global'}</p>
            </div>
          </div>
        </div>
      </motion.section>

    </div>
  )
}
