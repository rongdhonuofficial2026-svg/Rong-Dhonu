'use client'

import { motion, Variants } from "framer-motion"
import { StatisticsCard } from "@/components/museum/statistics-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Palette, Users, Brush } from "lucide-react"

export function HomeStatisticsContent({ locale, stats }: { locale: string, stats?: any }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  }

  const artworksCount = stats?.artworks || "1,248"
  const artistsCount = stats?.artists || "342"
  const exhibitionsCount = stats?.exhibitions || "14"

  return (
    <div className="relative w-full py-32 px-4 md:px-8 bg-[#FDFBF7]">
      {/* Soft color bleed from previous section */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#FDFBF7] to-transparent pointer-events-none -translate-y-full" />
      
      <div className="max-w-[90rem] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-6"
        >
          <h3 className="text-[10px] tracking-[0.5em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-6">
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
            {locale === 'bn' ? "আমাদের প্রভাব" : "Our Impact"}
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
          </h3>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <motion.div variants={item}>
            <div className="flex flex-col items-center justify-center p-14 bg-white/60 backdrop-blur-xl border border-[#1C1C1E]/5 hover:border-[#D4AF37] transition-all duration-700 hover:-translate-y-2 group museum-shadow">
              <Palette className="w-10 h-10 text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              <p className="font-serif text-6xl md:text-7xl text-[#1C1C1E] mb-4 font-bold">{artworksCount}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#1C1C1E]/60 font-semibold">{locale === 'bn' ? "মোট শিল্পকর্ম" : "Curated Artworks"}</p>
            </div>
          </motion.div>
          <motion.div variants={item}>
            <div className="flex flex-col items-center justify-center p-14 bg-white/60 backdrop-blur-xl border border-[#1C1C1E]/5 hover:border-[#D4AF37] transition-all duration-700 hover:-translate-y-2 group museum-shadow">
              <Users className="w-10 h-10 text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              <p className="font-serif text-6xl md:text-7xl text-[#1C1C1E] mb-4 font-bold">{artistsCount}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#1C1C1E]/60 font-semibold">{locale === 'bn' ? "সক্রিয় শিল্পী" : "Global Artists"}</p>
            </div>
          </motion.div>
          <motion.div variants={item}>
            <div className="flex flex-col items-center justify-center p-14 bg-white/60 backdrop-blur-xl border border-[#1C1C1E]/5 hover:border-[#D4AF37] transition-all duration-700 hover:-translate-y-2 group museum-shadow">
              <Brush className="w-10 h-10 text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              <p className="font-serif text-6xl md:text-7xl text-[#1C1C1E] mb-4 font-bold">{exhibitionsCount}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#1C1C1E]/60 font-semibold">{locale === 'bn' ? "প্রদর্শনীসমূহ" : "Major Exhibitions"}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  return (
    <div className="relative w-full py-32 px-4 md:px-8 artistic-gradient-1 overflow-hidden">
      {/* Ambient glowing orbs */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas.png')] opacity-[0.1] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      {/* Bleed into footer */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#1C1C1E] to-transparent pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto space-y-10 text-center relative z-10 glass-dark p-12 md:p-20 border-t-4 border-[#D4AF37]"
      >
        <h3 className="text-xs tracking-[0.5em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-6">
          <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
          Newsletter
          <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
        </h3>
        <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#FDFBF7] text-shadow-elegant">
          {content.title || "Join Our Journey"}
        </h2>
        <p className="text-[#FDFBF7]/90 text-xl font-serif italic max-w-2xl mx-auto leading-relaxed">
          {content.description || "Subscribe to our exclusive newsletter for early access to exhibitions, artist interviews, and curated collections."}
        </p>
        
        <form className="flex w-full max-w-2xl mx-auto items-center mt-12 bg-white/10 backdrop-blur-md p-2 border border-white/20 focus-within:border-[#D4AF37] transition-all duration-500 rounded-none shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)]">
          <Input 
            type="email" 
            placeholder={locale === 'bn' ? "আপনার ইমেইল ঠিকানা" : "Your email address"} 
            className="bg-transparent text-[#FDFBF7] border-none rounded-none placeholder:text-[#FDFBF7]/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-16 text-lg px-6 w-full font-light"
            required
          />
          <Button 
            type="submit" 
            variant="secondary" 
            className="bg-[#D4AF37] text-black hover:bg-[#FDFBF7] rounded-none h-16 px-12 text-sm uppercase tracking-[0.3em] font-bold transition-transform duration-500 hover:scale-[1.02]"
          >
            {locale === 'bn' ? "যুক্ত হোন" : "Subscribe"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
