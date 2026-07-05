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
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16 space-y-6"
      >
        <h3 className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-semibold flex items-center justify-center gap-4">
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
          {locale === 'bn' ? "আমাদের প্রভাব" : "Our Impact"}
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
        </h3>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        <motion.div variants={item}>
          <div className="flex flex-col items-center justify-center p-12 bg-[#111111] border border-[#FDFBF7]/5 hover:border-[#D4AF37]/30 transition-colors duration-500">
            <Palette className="w-8 h-8 text-[#D4AF37] mb-6" strokeWidth={1} />
            <p className="font-serif text-5xl md:text-6xl text-[#FDFBF7] mb-4">{artworksCount}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FDFBF7]/60">{locale === 'bn' ? "মোট শিল্পকর্ম" : "Curated Artworks"}</p>
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="flex flex-col items-center justify-center p-12 bg-[#111111] border border-[#FDFBF7]/5 hover:border-[#D4AF37]/30 transition-colors duration-500">
            <Users className="w-8 h-8 text-[#D4AF37] mb-6" strokeWidth={1} />
            <p className="font-serif text-5xl md:text-6xl text-[#FDFBF7] mb-4">{artistsCount}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FDFBF7]/60">{locale === 'bn' ? "সক্রিয় শিল্পী" : "Global Artists"}</p>
          </div>
        </motion.div>
        <motion.div variants={item}>
          <div className="flex flex-col items-center justify-center p-12 bg-[#111111] border border-[#FDFBF7]/5 hover:border-[#D4AF37]/30 transition-colors duration-500">
            <Brush className="w-8 h-8 text-[#D4AF37] mb-6" strokeWidth={1} />
            <p className="font-serif text-5xl md:text-6xl text-[#FDFBF7] mb-4">{exhibitionsCount}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FDFBF7]/60">{locale === 'bn' ? "প্রদর্শনীসমূহ" : "Major Exhibitions"}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <h3 className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-semibold flex items-center justify-center gap-4">
        <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
        Newsletter
        <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
      </h3>
      <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#FDFBF7]">
        {content.title || "Join Our Journey"}
      </h2>
      <p className="text-[#FDFBF7]/70 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
        {content.description || "Subscribe to our exclusive newsletter for early access to exhibitions, artist interviews, and curated collections."}
      </p>
      
      <form className="flex w-full max-w-lg mx-auto items-center mt-12 bg-[#FDFBF7]/5 backdrop-blur-md p-1 border border-[#FDFBF7]/10 focus-within:border-[#D4AF37]/50 transition-colors duration-300">
        <Input 
          type="email" 
          placeholder={locale === 'bn' ? "আপনার ইমেইল ঠিকানা" : "Your email address"} 
          className="bg-transparent text-[#FDFBF7] border-none rounded-none placeholder:text-[#FDFBF7]/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-16 text-lg px-6 w-full font-light"
          required
        />
        <Button 
          type="submit" 
          variant="secondary" 
          className="bg-[#D4AF37] text-black hover:bg-[#FDFBF7] rounded-none h-16 px-10 text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-300"
        >
          {locale === 'bn' ? "যুক্ত হোন" : "Subscribe"}
        </Button>
      </form>
    </motion.div>
  )
}
