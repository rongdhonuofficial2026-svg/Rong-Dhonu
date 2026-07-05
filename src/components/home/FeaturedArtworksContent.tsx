'use client'

import { motion, Variants } from "framer-motion"
import { GalleryGrid } from "@/components/museum/gallery-grid"
import { ArtworkCard } from "@/components/museum/artwork-card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { EmptyState } from "@/components/museum/states"
import Image from "next/image"

interface FeaturedArtworksContentProps {
  locale: string
  displayData: any[]
  hasData: boolean
}

export function FeaturedArtworksContent({ locale, displayData, hasData }: FeaturedArtworksContentProps) {
  const title = locale === 'bn' ? "প্রদর্শিত শিল্পকর্ম" : "Curated Collection"
  const subtitle = locale === 'bn' ? "আমাদের সর্বশেষ সংগ্রহ থেকে নির্বাচিত কিছু সেরা কাজ" : "A curated selection of masterpieces from our latest collection."
  
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  }

  if (displayData.length === 0) {
    return <EmptyState title="No artworks available" />
  }

  return (
    <div className="relative w-full bg-[#1A1A1A] py-32 px-4 md:px-8">
      
      {/* Decorative ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C1C1E]/0 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[100rem] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24 space-y-6"
        >
          <h3 className="text-[10px] tracking-[0.5em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-6">
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
            The Collection
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
          </h3>
          <h2 className="font-serif text-5xl md:text-7xl text-[#FDFBF7] font-bold text-shadow-elegant">{title}</h2>
          <p className="text-[#FDFBF7]/70 max-w-2xl mx-auto font-light text-lg tracking-wide">{subtitle}</p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <GalleryGrid columns="3">
            {displayData.map((artwork: any, index: number) => {
              const artworkTitle = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
              const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
              const artistName = hasData 
                ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
                : artwork.artist_name

              // Create staggered heights for broken masonry feel
              const isLarge = index % 3 === 0
              const heightClass = isLarge ? "h-[600px]" : "h-[400px]"

              return (
                <motion.div key={artwork.id} variants={item} className="break-inside-avoid mb-8">
                  <Link href={`/gallery/artwork/${artwork.id}`} className="group block relative w-full overflow-hidden museum-shadow-dark">
                    <div className={`relative w-full ${heightClass} image-zoom-container`}>
                      <Image
                        src={artwork.main_image_url}
                        alt={artworkTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Glass Overlay for Details */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8 border border-transparent group-hover:border-white/20">
                      <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]">
                        <h4 className="font-serif text-2xl text-white font-bold mb-2">{artworkTitle}</h4>
                        <p className="text-white/80 text-sm tracking-widest uppercase mb-4">{artistName}</p>
                        <p className="text-[#D4AF37] text-xs uppercase tracking-widest">{medium}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </GalleryGrid>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 text-center"
        >
          <Button 
            asChild 
            variant="outline" 
            className="rounded-none px-12 py-8 text-sm tracking-[0.2em] uppercase font-bold border-[#FDFBF7]/20 text-[#FDFBF7] hover:bg-[#FDFBF7] hover:text-[#1A1A1A] transition-all duration-500 bg-transparent glass-dark"
          >
            <Link href="/gallery">{locale === 'bn' ? 'সম্পূর্ণ গ্যালারি দেখুন' : 'Explore Full Collection'}</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
