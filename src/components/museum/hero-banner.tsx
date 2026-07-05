import Image from "next/image"
import { cn } from "@/lib/utils"

interface HeroBannerProps {
  title: string
  subtitle?: string
  imageUrl: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
  overlayOpacity?: "light" | "medium" | "dark"
}

export function HeroBanner({
  title,
  subtitle,
  imageUrl,
  primaryAction,
  secondaryAction,
  className,
  overlayOpacity = "medium"
}: HeroBannerProps) {
  
  const opacityMap = {
    light: "bg-black/30",
    medium: "bg-black/50",
    dark: "bg-black/70"
  }

  return (
    <div className={cn("relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden", className)}>
      <Image
        src={imageUrl}
        alt="Hero Background"
        fill
        priority
        className="object-cover"
      />
      <div className={cn("absolute inset-0 z-10", opacityMap[overlayOpacity])} />
      
      <div className="relative z-20 container mx-auto px-6 text-center flex flex-col items-center">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-md max-w-4xl">
          {title}
        </h1>
        
        {subtitle && (
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl font-sans drop-shadow">
            {subtitle}
          </p>
        )}
        
        {(primaryAction || secondaryAction) && (
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  )
}
