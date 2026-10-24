'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ZoomIn, X, Maximize2, Minimize2 } from 'lucide-react'

interface ArtworkViewProps {
  src: string | null
  alt: string
  aspectRatioHint?: string | null
}

export function ArtworkImageViewer({ src, alt, aspectRatioHint }: ArtworkViewProps) {
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxZoomed, setLightboxZoomed] = useState(false)

  // Handle ESC key to close lightbox
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false)
        setLightboxZoomed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scrolling when lightbox is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isLightboxOpen])

  if (!src) {
    return (
      <div className="w-full min-h-[360px] rounded-2xl border border-white/10 bg-[#151210] flex flex-col items-center justify-center p-8 text-center">
        <span className="font-serif text-2xl text-[#F4EEDF]/40 italic">No Image Available</span>
        <span className="text-xs text-[#F4EEDF]/25 mt-2">The artwork file has not been archived yet.</span>
      </div>
    )
  }

  // Derive aspect ratio: natural dimensions if loaded, fallback to hint or default
  const calculatedRatio = naturalDimensions 
    ? `${naturalDimensions.width} / ${naturalDimensions.height}`
    : (aspectRatioHint || undefined)

  return (
    <>
      <div className="relative w-full flex flex-col items-center">
        {/* Gallery Mat / Showcase Stage */}
        <div 
          className="group relative w-full flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-500 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #1A1613 0%, #100D0B 75%, #0B0908 100%)',
            padding: 'clamp(1rem, 3.5vw, 2.5rem)',
          }}
        >
          {/* Subtle museum spotlight glow behind artwork */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-700 group-hover:opacity-60"
            style={{
              background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(200, 169, 106, 0.08) 0%, transparent 80%)'
            }}
          />

          {/* Artwork Container - naturally sized, max-height bounded to viewport */}
          <div 
            className="relative flex items-center justify-center max-w-full transition-transform duration-500 will-change-transform"
            style={{
              maxHeight: 'min(75vh, 850px)',
              aspectRatio: calculatedRatio,
            }}
          >
            {/* The artwork image */}
            <img
              src={src}
              alt={alt}
              loading="eager"
              decoding="async"
              onLoad={(e) => {
                const img = e.currentTarget
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  })
                }
              }}
              className="max-w-full object-contain rounded-md shadow-[0_12px_40px_rgba(0,0,0,0.65)] border border-white/5"
              style={{
                maxHeight: 'min(72vh, 820px)',
                width: 'auto',
                height: 'auto',
                display: 'block',
              }}
            />

            {/* Floating Zoom / Inspection Action */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Inspect artwork in high resolution"
              className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-[#F4EEDF] text-xs font-sans tracking-wider uppercase opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-[#C8A96A] hover:text-[#0B0908] hover:border-[#C8A96A] shadow-xl"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Inspect</span>
            </button>
          </div>
        </div>

        {/* Framing & Integrity Notice */}
        <div className="flex items-center justify-between w-full px-2 pt-3 text-[11px] text-[#F4EEDF]/40 tracking-wider uppercase font-mono">
          <span>Official Exhibition Plate</span>
          {naturalDimensions && (
            <span>{naturalDimensions.width} × {naturalDimensions.height} px</span>
          )}
        </div>
      </div>

      {/* Museum High-Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0908]/96 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => {
            setIsLightboxOpen(false)
            setLightboxZoomed(false)
          }}
        >
          {/* Top Control Bar */}
          <div 
            className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96A] font-semibold">Artwork Inspection</span>
              <span className="text-sm font-serif text-[#F4EEDF] truncate max-w-xs md:max-w-md">{alt}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLightboxZoomed((prev) => !prev)}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-[#F4EEDF] flex items-center justify-center transition-colors"
                title={lightboxZoomed ? "Fit to screen" : "Actual size zoom"}
                aria-label="Toggle zoom scale"
              >
                {lightboxZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false)
                  setLightboxZoomed(false)
                }}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-[#F4EEDF] flex items-center justify-center transition-colors"
                title="Close (Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Container */}
          <div 
            className={`relative max-w-[92vw] max-h-[85vh] flex items-center justify-center overflow-auto p-4 transition-all duration-300 ${
              lightboxZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setLightboxZoomed((prev) => !prev)
            }}
          >
            <img
              src={src}
              alt={alt}
              className={`transition-all duration-300 rounded shadow-[0_25px_80px_rgba(0,0,0,0.9)] select-none ${
                lightboxZoomed 
                  ? 'max-w-none max-h-none scale-125 md:scale-150' 
                  : 'max-w-[88vw] max-h-[82vh] object-contain'
              }`}
            />
          </div>

          {/* Bottom helper tip */}
          <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none text-xs text-[#F4EEDF]/40 tracking-wider">
            Click image to {lightboxZoomed ? 'fit viewport' : 'zoom'} · Press Esc to close
          </div>
        </div>
      )}
    </>
  )
}
