'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface CatalogPreviewModalProps {
  pdfUrl: string
  title: string
  catalogId: string
  isOpen: boolean
  onClose: () => void
}

export function CatalogPreviewModal({
  pdfUrl,
  title,
  catalogId,
  isOpen,
  onClose,
}: CatalogPreviewModalProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [engine, setEngine] = useState<'google' | 'direct'>('google')
  const modalContainerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {})
          }
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isFullscreen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsLoading(true)
      setHasError(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Fullscreen sync
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
    }
  }, [])

  if (!isOpen) return null

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200))
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50))
  const resetZoom = () => setZoom(100)

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const elem = modalContainerRef.current
        if (elem?.requestFullscreen) {
          await elem.requestFullscreen()
        } else if ((elem as any)?.webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen()
        } else {
          setIsFullscreen(true)
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch {
      setIsFullscreen((prev) => !prev)
    }
  }

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
  const activeUrl = engine === 'google' ? googleViewerUrl : pdfUrl

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
      aria-label={`PDF Preview: ${title}`}
    >
      <div
        ref={modalContainerRef}
        className={`relative z-10 flex flex-col w-full h-full bg-[#0E0C0A] ${
          isFullscreen ? 'max-w-none' : 'max-w-7xl mx-auto md:my-3 md:rounded-2xl border border-white/10 overflow-hidden shadow-2xl'
        }`}
      >
        {/* Control toolbar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3 bg-[#191512]/95 border-b border-white/10 shrink-0">
          
          {/* Title & file indicator */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-[#F4C662]/10 border border-[#F4C662]/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#F4C662]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[220px] sm:max-w-md">
              {title}
            </span>
          </div>

          {/* Action buttons (44px touch targets on mobile) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="h-10 px-2 text-xs text-white/80 font-mono hover:text-[#F4C662] transition-colors cursor-pointer"
                title="Reset zoom"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 200}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Reload button */}
            <button
              type="button"
              onClick={() => {
                setIsLoading(true)
                setHasError(false)
                const current = engine
                setEngine(current === 'google' ? 'direct' : 'google')
              }}
              className="w-10 h-10 min-w-[40px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl bg-black/40 border border-white/10 transition-colors cursor-pointer"
              title="Toggle reader engine / Reload"
              aria-label="Toggle reader engine or reload"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Open in new tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 min-w-[40px] px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-white/80 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
              title="Open raw PDF in new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Open Tab</span>
            </a>

            {/* Download via analytics API */}
            <a
              href={`/api/catalogs/download?id=${catalogId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-[#0B0908] bg-[#F4C662] hover:bg-[#ebd083] rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              title="Download PDF document"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-10 h-10 min-w-[40px] flex items-center justify-center text-white/70 hover:text-[#F4C662] hover:bg-white/10 rounded-xl bg-black/40 border border-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 min-w-[40px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl bg-black/40 border border-white/10 transition-colors cursor-pointer"
              title="Close preview (Esc)"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame Area */}
        <div className="relative flex-1 w-full overflow-auto bg-[#0B0908] flex items-center justify-center">
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B0908] gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#F4C662]" />
              <p className="text-sm font-serif text-[#F4EEDF]/70">Loading catalog document...</p>
            </div>
          )}

          {!hasError ? (
            <div
              className="w-full h-full transition-transform duration-200 origin-top"
              style={{
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                transformOrigin: 'top center',
              }}
            >
              <iframe
                key={`${activeUrl}-${engine}`}
                src={activeUrl}
                className="w-full h-full border-0 bg-neutral-900"
                title={`PDF Preview: ${title}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
                loading="eager"
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-downloads allow-forms"
              />
            </div>
          ) : (
            <div className="p-8 max-w-md text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-[#F4C662]" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Preview unavailable in embedded frame</h3>
              <p className="text-xs text-[#F4EEDF]/70 leading-relaxed">
                You can open the PDF directly in a new browser tab or download it.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#F4C662] text-[#0B0908] text-xs font-bold"
                >
                  Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false)
                    setIsLoading(true)
                    setEngine((e) => (e === 'google' ? 'direct' : 'google'))
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Retry Alternative
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint bar */}
        <div className="shrink-0 px-4 py-2.5 bg-[#151210] border-t border-white/10 flex items-center justify-between text-xs text-[#F4EEDF]/50">
          <p className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[10px]">Esc</kbd> or click close to exit</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F4C662] hover:underline font-semibold ml-auto"
          >
            Open in Native PDF Reader →
          </a>
        </div>
      </div>
    </div>
  )
}
