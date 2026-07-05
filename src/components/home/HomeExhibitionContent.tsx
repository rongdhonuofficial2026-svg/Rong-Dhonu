'use client'

import { motion } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

interface HomeExhibitionContentProps {
  locale: string
  currentExhibition: any
  timelineItems: any[]
}

export function HomeExhibitionContent({ locale, currentExhibition, timelineItems }: HomeExhibitionContentProps) {
  const title = locale === 'bn' ? (currentExhibition.title_bn || currentExhibition.title_en) : currentExhibition.title_en
  const venue = locale === 'bn' ? (currentExhibition.venue_bn || currentExhibition.venue_en) : currentExhibition.venue_en
  
  const startDate = new Date(currentExhibition.start_date)
  const formattedDate = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }).format(startDate)

  return (
    <div className="relative w-full flex flex-col items-center bg-[#1C1C1E] py-24 md:py-40 mt-32">
      
      {/* Top transition gradient from cream to charcoal */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#FDFBF7] to-transparent -translate-y-full pointer-events-none" />

      {/* Ambient background lighting */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent opacity-50" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16 space-y-6 relative z-10 px-4"
      >
        <h3 className="text-xs tracking-[0.5em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-6">
          <span className="w-16 h-[2px] bg-[#D4AF37]"></span>
          {locale === 'bn' ? "বর্তমান প্রদর্শনী" : "Featured Exhibition"}
          <span className="w-16 h-[2px] bg-[#D4AF37]"></span>
        </h3>
        <h2 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] text-[#FDFBF7] max-w-5xl mx-auto leading-[1.1] font-bold text-shadow-elegant">
          {title}
        </h2>
      </motion.div>

      {/* Large Banner Image - Full Width Bleed */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[95%] max-w-[120rem] mx-auto h-[60vh] md:h-[85vh] group overflow-hidden museum-shadow-dark"
      >
        <div className="absolute inset-0 w-full h-full image-zoom-container">
          <Image 
            src={currentExhibition.hero_image_url} 
            alt={title} 
            fill 
            className="object-cover"
          />
        </div>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1E]/80 via-transparent to-transparent pointer-events-none" />
        
        {/* Info Box Floating - Glassmorphism */}
        <div className="absolute bottom-10 left-4 right-4 md:bottom-20 md:left-20 max-w-3xl glass-dark p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-l-[6px] border-[#D4AF37]">
          <div className="flex flex-col gap-6 text-[#FDFBF7]">
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xl md:text-2xl font-light tracking-wider font-serif">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xl md:text-2xl font-light tracking-wider font-serif">{venue}</span>
            </div>
          </div>
          
          <Button 
            asChild 
            className="bg-[#D4AF37] text-black hover:bg-[#FDFBF7] transition-all duration-500 hover:scale-105 px-10 py-8 text-sm uppercase tracking-[0.2em] font-bold rounded-none group/btn shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
          >
            <Link href={`/exhibitions/${currentExhibition.id}`} className="flex items-center gap-4">
              {locale === 'bn' ? "বিস্তারিত দেখুন" : "Enter Exhibition"}
              <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover/btn:translate-x-2" />
            </Link>
          </Button>
        </div>
      </motion.div>

    </div>
  )
}
