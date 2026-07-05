'use client'

import { motion } from "framer-motion"
import Image from "next/image"

export function HomeSponsorsContent({ locale, content }: { locale: string, content: any }) {
  if (!content.logos || content.logos.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="container mx-auto px-6 text-center"
    >
      <h3 className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-semibold flex items-center justify-center gap-4 mb-16">
        <span className="w-8 h-[1px] bg-muted-foreground/30"></span>
        {content.title || (locale === 'bn' ? "সহযোগিতায়" : "Supported By")}
        <span className="w-8 h-[1px] bg-muted-foreground/30"></span>
      </h3>
      
      <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-60 hover:opacity-100 transition-opacity duration-700">
        {content.logos.map((logo: { name: string, url: string }, i: number) => (
          <div key={i} className="relative w-32 h-16 grayscale hover:grayscale-0 transition-all duration-500">
            <Image 
              src={logo.url} 
              alt={logo.name}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function HomeTestimonialsContent({ locale, content }: { locale: string, content: any }) {
  if (!content.items || content.items.length === 0) return null

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20 space-y-6"
      >
        <h3 className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-semibold flex items-center justify-center gap-4">
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
          Voices
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
        </h3>
        <h2 className="font-serif text-4xl md:text-5xl text-[#1C1C1E]">
          {content.title || (locale === 'bn' ? "দর্শনার্থীদের মতামত" : "What They Say")}
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {content.items.map((item: any, i: number) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-10 lg:p-12 border border-black/5 relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="text-[#D4AF37] font-serif text-6xl absolute top-6 left-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              "
            </div>
            <p className="text-[#1C1C1E]/80 text-lg md:text-xl italic leading-relaxed mb-10 mt-6 z-10 relative font-light min-h-[120px]">
              {locale === 'bn' ? (item.quote_bn || item.quote_en) : item.quote_en}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex flex-shrink-0 items-center justify-center text-white font-serif text-xl">
                {item.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[#1C1C1E] tracking-wide">{item.author}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  {locale === 'bn' ? (item.role_bn || item.role_en) : item.role_en}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
