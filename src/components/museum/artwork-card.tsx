'use client'

import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ArtworkCardProps {
  title: string
  artistName: string
  imageUrl: string
  medium?: string
  status?: "pending" | "approved" | "rejected" | "sold" | "available"
  className?: string
  onClick?: () => void
}

export function ArtworkCard({
  title,
  artistName,
  imageUrl,
  medium,
  status,
  className,
  onClick
}: ArtworkCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden bg-card cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-shadow duration-500",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/20">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status Badge */}
        {status && (
          <div className="absolute top-4 right-4 z-10">
            <Badge 
              variant={status === 'available' ? 'default' : status === 'sold' ? 'destructive' : 'secondary'}
              className="bg-black/40 backdrop-blur-md text-white border-white/20 font-medium tracking-widest uppercase text-[10px] px-3 py-1"
            >
              {status}
            </Badge>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content Reveal on Hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 flex flex-col justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          <p className="font-serif text-2xl font-bold text-white line-clamp-1 drop-shadow-md">{title}</p>
          <div className="h-[1px] w-8 bg-white/50 my-3 transition-all duration-500 group-hover:w-16" />
          <p className="text-sm text-white/90 font-light tracking-wide uppercase">{artistName}</p>
          {medium && <p className="text-xs text-white/60 mt-1 font-light">{medium}</p>}
        </div>
      </div>
    </motion.div>
  )
}
