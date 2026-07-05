'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface PremiumImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined
  fallbackSrc: string
  /**
   * Optional class(es) for the wrapper div.
   *
   * ──────────────────────────────────────────────────────────────────────────
   * IMPORTANT: When you pass `fill`, Next.js makes the <Image> element
   * position:absolute inset-0. The wrapper div MUST have an explicit size.
   *
   * • If the parent already has a defined size (e.g. `absolute inset-0`,
   *   `w-full h-[500px]`), pass nothing and PremiumImage will default to
   *   `absolute inset-0 overflow-hidden` so it fills that parent.
   *
   * • If PremiumImage itself should provide the size (e.g. masonry cards),
   *   pass the size through containerClassName:
   *       containerClassName="relative w-full h-[500px]"
   * ──────────────────────────────────────────────────────────────────────────
   */
  containerClassName?: string
}

export function PremiumImage({
  src,
  fallbackSrc,
  alt,
  className,
  containerClassName,
  fill,
  ...props
}: PremiumImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const imageSrc = (src && !error) ? src : fallbackSrc

  /**
   * Container strategy:
   * - With `fill`: default to `absolute inset-0 overflow-hidden` so the image
   *   fills whatever positioned ancestor wraps this component.
   *   containerClassName can override to e.g. `relative w-full h-[400px]` when
   *   PremiumImage itself should own the sizing.
   * - Without `fill`: default to `relative overflow-hidden` (standard block).
   */
  const defaultContainer = fill
    ? 'absolute inset-0 overflow-hidden'
    : 'relative overflow-hidden'

  const containerClass = containerClassName
    ? containerClassName          // caller fully controls the container
    : defaultContainer            // smart default based on fill mode

  return (
    <div className={containerClass}>
      {/* Skeleton shimmer — shown until image loads */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-neutral-200/60 to-neutral-300/40 animate-pulse pointer-events-none" />
      )}

      <Image
        src={imageSrc}
        alt={alt || 'Artwork'}
        fill={fill}
        unoptimized          // serve images directly from CDN without Next.js edge processing
        className={cn(
          'transition-opacity duration-500 ease-out',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)    // swap to local fallback on any network/remote error
          setLoading(false)
        }}
        {...props}
      />
    </div>
  )
}
