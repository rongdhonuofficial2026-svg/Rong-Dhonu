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
    <div className="relative w-full bg-[#FDFBF7] py-32 px-4 md:px-8 mt-10">
      
      {/* Decorative brush overlays */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1A1A1A] to-transparent pointer-events-none -translate-y-full" />
      <div className="absolute top-10 right-20 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-20 w-[500px] h-[500px] bg-[#FF7F50]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto max-w-[100rem] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24 space-y-6"
        >
          <h3 className="text-[10px] tracking-[0.5em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-6">
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
            Voices
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
          </h3>
          <h2 className="font-serif text-5xl md:text-7xl text-[#1C1C1E] font-bold text-shadow-elegant">
            {content.title || (locale === 'bn' ? "দর্শনার্থীদের মতামত" : "What They Say")}
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {content.items.map((item: any, i: number) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="glass p-12 lg:p-14 relative group hover:-translate-y-4 transition-all duration-700 ease-[0.16,1,0.3,1] bg-white/80"
            >
              {/* Premium Quote Mark */}
              <div className="text-[#D4AF37] font-serif text-8xl md:text-[8rem] absolute top-2 left-6 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 leading-none pointer-events-none">
                "
              </div>
              <p className="text-[#1C1C1E]/90 text-xl md:text-2xl italic leading-relaxed mb-12 mt-8 z-10 relative font-serif min-h-[140px]">
                {locale === 'bn' ? (item.quote_bn || item.quote_en) : item.quote_en}
              </p>
              
              <div className="flex items-center gap-6 border-t border-[#1C1C1E]/10 pt-8 mt-auto">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1C1C1E] to-[#3a3a3c] flex flex-shrink-0 items-center justify-center text-white font-serif text-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#1C1C1E] tracking-wide text-lg">{item.author}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold mt-1">
                    {locale === 'bn' ? (item.role_bn || item.role_en) : item.role_en}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
