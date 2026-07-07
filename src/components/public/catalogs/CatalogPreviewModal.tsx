'use client'

import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, ExternalLink, Download, ChevronLeft, ChevronRight } from 'lucide-react'

interface CatalogPreviewModalProps {
  pdfUrl: string
  title: string
  catalogId: string
  isOpen: boolean
  onClose: () => void
}

export function CatalogPreviewModal({ pdfUrl, title, catalogId, isOpen, onClose }: CatalogPreviewModalProps) {
  const [zoom, setZoom] = useState(100)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const zoomIn = () => setZoom(z => Math.min(z + 25, 200))
  const zoomOut = () => setZoom(z => Math.max(z - 25, 50))

  // Build viewer URL — use Google Docs viewer as primary with iframe fallback
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-label={`PDF Preview: ${title}`}
    >
      {/* Glassmorphic backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal container */}
      <div className="relative z-10 flex flex-col w-full h-full max-w-6xl mx-auto">
        
        {/* Control bar */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-black/70 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white truncate">{title}</span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-lg px-1">
              <button
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-30"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-white/60 min-w-[2.5rem] text-center font-mono">{zoom}%</span>
              <button
                onClick={zoomIn}
                disabled={zoom >= 200}
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-30"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Open in new tab */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>

            {/* Download via analytics API */}
            <a
              href={`/api/catalogs/download?id=${catalogId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/80 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close preview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 overflow-auto bg-neutral-900 relative">
          <div
            className="w-full h-full transition-transform origin-top"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={googleViewerUrl}
              className="w-full border-0"
              style={{ height: `${Math.max(100, 100 * (100 / zoom))}vh` }}
              title={`PDF Preview: ${title}`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>

        {/* Hint bar */}
        <div className="shrink-0 px-4 py-2 bg-black/60 backdrop-blur-xl border-t border-white/5 flex items-center justify-center">
          <p className="text-xs text-white/30">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono text-[10px]">Esc</kbd> or click outside to close</p>
        </div>
      </div>
    </div>
  )
}
