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
    <div className="max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16 space-y-6"
      >
        <h3 className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-semibold flex items-center justify-center gap-4">
          <span className="w-12 h-[1px] bg-[#D4AF37]"></span>
          {locale === 'bn' ? "বর্তমান প্রদর্শনী" : "Featured Exhibition"}
          <span className="w-12 h-[1px] bg-[#D4AF37]"></span>
        </h3>
        <h2 className="font-serif text-4xl md:text-6xl text-[#FDFBF7] max-w-4xl mx-auto leading-tight">
          {title}
        </h2>
      </motion.div>

      {/* Large Banner Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-[50vh] md:h-[70vh] group overflow-hidden"
      >
        <Image 
          src={currentExhibition.hero_image_url} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/20 to-transparent" />
        
        {/* Info Box Floating */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex flex-col gap-4 text-[#FDFBF7]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-lg md:text-xl font-light tracking-wide">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-lg md:text-xl font-light tracking-wide">{venue}</span>
            </div>
          </div>
          
          <Button 
            asChild 
            className="bg-[#D4AF37] text-black hover:bg-[#FDFBF7] transition-colors duration-300 px-8 py-6 text-sm uppercase tracking-[0.2em] font-semibold rounded-none group/btn"
          >
            <Link href={`/exhibitions/${currentExhibition.id}`} className="flex items-center gap-3">
              {locale === 'bn' ? "বিস্তারিত দেখুন" : "Explore Exhibition"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </motion.div>

    </div>
  )
}
