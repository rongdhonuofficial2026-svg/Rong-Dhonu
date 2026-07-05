'use client'

import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

interface HeroBannerProps {
  title: string
  subtitle?: string
  imageUrl: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
  overlayOpacity?: "light" | "medium" | "dark"
  fullScreen?: boolean
}

export function HeroBanner({
  title,
  subtitle,
  imageUrl,
  primaryAction,
  secondaryAction,
  className,
  overlayOpacity = "medium",
  fullScreen = false,
}: HeroBannerProps) {
  
  const opacityMap = {
    light: "bg-gradient-to-b from-black/20 via-black/10 to-black/40",
    medium: "bg-gradient-to-b from-black/40 via-black/30 to-black/60",
    dark: "bg-gradient-to-b from-black/70 via-black/50 to-black/80"
  }

  return (
    <div className={cn("relative w-full flex items-center justify-center overflow-hidden", fullScreen ? "h-[100svh]" : "h-[60vh] min-h-[500px]", className)}>
      <motion.div 
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={imageUrl}
          alt="Hero Background"
          fill
          priority
          className="object-cover"
        />
      </motion.div>
      <div className={cn("absolute inset-0 z-10", opacityMap[overlayOpacity])} />
      
      <div className="relative z-20 container mx-auto px-6 text-center flex flex-col items-center mt-16">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-lg max-w-5xl"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-8 text-lg md:text-2xl text-white/90 max-w-3xl font-sans drop-shadow-md font-light tracking-wide"
          >
            {subtitle}
          </motion.p>
        )}
        
        {(primaryAction || secondaryAction) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row gap-6 items-center justify-center"
          >
            {primaryAction}
            {secondaryAction}
          </motion.div>
        )}
      </div>

      {fullScreen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.3em] font-medium">Scroll Discover</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
