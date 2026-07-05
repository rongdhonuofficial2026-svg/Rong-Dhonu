'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface PremiumImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined
  fallbackSrc: string
  containerClassName?: string
}

export function PremiumImage({ 
  src, 
  fallbackSrc, 
  alt, 
  className, 
  containerClassName,
  ...props 
}: PremiumImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const imageSrc = (src && !error) ? src : fallbackSrc

  return (
    <div className={cn("relative overflow-hidden bg-black/5", containerClassName)}>
      {/* Skeleton loader */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-black/10 animate-pulse z-0" />
      )}
      
      <Image
        src={imageSrc}
        alt={alt || "Artwork"}
        className={cn(
          "transition-all duration-700 ease-in-out z-10",
          loading ? "scale-105 blur-md" : "scale-100 blur-0",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
        {...props}
      />
    </div>
  )
}
