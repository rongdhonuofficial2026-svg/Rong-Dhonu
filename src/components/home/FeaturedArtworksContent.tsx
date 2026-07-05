'use client'

import { motion, Variants } from "framer-motion"
import { GalleryGrid } from "@/components/museum/gallery-grid"
import { ArtworkCard } from "@/components/museum/artwork-card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { EmptyState } from "@/components/museum/states"

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
    <>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20 space-y-6"
      >
        <h3 className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-semibold flex items-center justify-center gap-4">
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
          The Gallery
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
        </h3>
        <h2 className="font-serif text-4xl md:text-5xl text-[#FDFBF7]">{title}</h2>
        <p className="text-[#FDFBF7]/60 max-w-2xl mx-auto font-light">{subtitle}</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <GalleryGrid columns="3">
          {displayData.map((artwork: any) => {
            const artworkTitle = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
            const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
            const artistName = hasData 
              ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
              : artwork.artist_name

            return (
              <motion.div key={artwork.id} variants={item} className="break-inside-avoid">
                <Link href={`/gallery/artwork/${artwork.id}`} className="group block">
                  <div className="relative overflow-hidden mb-4">
                    <ArtworkCard
                      title={artworkTitle}
                      artistName={artistName || "Unknown Artist"}
                      medium={medium}
                      imageUrl={artwork.main_image_url}
                      status={artwork.status as any}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <span className="text-[#FDFBF7] text-sm uppercase tracking-widest font-semibold border border-[#FDFBF7]/30 px-6 py-3 backdrop-blur-sm">View Details</span>
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
        className="mt-20 text-center"
      >
        <Button 
          asChild 
          variant="outline" 
          className="rounded-none px-10 py-7 text-sm tracking-widest uppercase border-[#FDFBF7]/20 text-[#FDFBF7] hover:bg-[#FDFBF7] hover:text-[#111111] transition-all bg-transparent backdrop-blur-sm"
        >
          <Link href="/gallery">{locale === 'bn' ? 'সম্পূর্ণ গ্যালারি দেখুন' : 'Explore Full Collection'}</Link>
        </Button>
      </motion.div>
    </>
  )
}
