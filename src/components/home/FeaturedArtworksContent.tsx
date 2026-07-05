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
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <GalleryGrid columns="3">
          {displayData.map((artwork: any) => {
            const title = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
            const medium = locale === 'bn' ? (artwork.medium_bn || artwork.medium_en) : artwork.medium_en
            const artistName = hasData 
              ? (locale === 'bn' ? (artwork.profiles?.full_name_bn || artwork.profiles?.full_name_en) : artwork.profiles?.full_name_en)
              : artwork.artist_name

            return (
              <motion.div key={artwork.id} variants={item} className="break-inside-avoid">
                <Link href={`/gallery/artwork/${artwork.id}`}>
                  <ArtworkCard
                    title={title}
                    artistName={artistName || "Unknown Artist"}
                    medium={medium}
                    imageUrl={artwork.main_image_url}
                    status={artwork.status as any}
                  />
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
        <Button asChild variant="outline" className="rounded-none px-10 py-7 text-sm tracking-widest uppercase border-foreground/20 hover:bg-foreground hover:text-background transition-all">
          <Link href="/gallery">{locale === 'bn' ? 'সম্পূর্ণ গ্যালারি দেখুন' : 'Explore Full Collection'}</Link>
        </Button>
      </motion.div>
    </>
  )
}
