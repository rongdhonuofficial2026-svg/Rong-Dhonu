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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-sm border border-border cursor-pointer",
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
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status Badge */}
        {status && (
          <div className="absolute top-3 right-3 z-10">
            <Badge 
              variant={status === 'available' ? 'default' : status === 'sold' ? 'destructive' : 'secondary'}
              className="glass font-semibold tracking-wide uppercase text-xs"
            >
              {status}
            </Badge>
          </div>
        )}

        {/* Glassmorphism Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full glass p-4 transition-transform duration-500 ease-out group-hover:translate-y-0">
          <p className="font-serif text-lg font-bold text-foreground line-clamp-1">{title}</p>
          <p className="text-sm text-foreground/80 font-medium">{artistName}</p>
          {medium && <p className="text-xs text-foreground/60 mt-1">{medium}</p>}
        </div>
      </div>
    </motion.div>
  )
}
