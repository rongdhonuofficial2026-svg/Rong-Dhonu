'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import {
  ArrowLeft,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Calendar,
  Globe,
  Layers,
  Sparkles,
  ArrowDownToLine,
  RefreshCw,
  AlertCircle,
  Eye,
  Loader2,
  Check,
  Share2
} from 'lucide-react'
import { toast } from 'sonner'

interface CatalogData {
  id: string
  title_en: string
  title_bn?: string | null
  description_en?: string | null
  description_bn?: string | null
  pdf_url: string
  cover_image_url?: string | null
  language: string
  version: string
  file_size?: number | null
  page_count?: number | null
  total_downloads?: number | null
  published_at?: string | null
  created_at: string
  exhibitions: {
    id: string
    theme_en: string
    theme_bn?: string | null
    year: number
    hero_image_url?: string | null
    status: string
  }
}

interface CatalogPreviewViewProps {
  catalog: CatalogData
  locale: string
}

export function CatalogPreviewView({ catalog, locale }: CatalogPreviewViewProps) {
  const ex = catalog.exhibitions
  const exhibitionTitle = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
  const title = locale === 'bn' && catalog.title_bn ? catalog.title_bn : catalog.title_en
  const description = locale === 'bn' && catalog.description_bn ? catalog.description_bn : catalog.description_en
  const coverImage = catalog.cover_image_url || ex.hero_image_url || '/images/catalogs/featured.png'

  // Viewer modes: 'reader' (PDF iframe) or 'cover' (artwork inspection)
  const [viewMode, setViewMode] = useState<'reader' | 'cover'>('reader')
  
  // PDF engine: 'google' (works across browsers) or 'direct' (native desktop browser PDF reader)
  const [pdfEngine, setPdfEngine] = useState<'google' | 'direct'>('google')
  
  // Sizing & Zoom state
  const [zoom, setZoom] = useState<number>(100)
  const [fitMode, setFitMode] = useState<'page' | 'width'>('page')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true)
  const [iframeError, setIframeError] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Pan / Drag state for cover inspection zoom
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const viewerContainerRef = useRef<HTMLDivElement>(null)

  // Format publication date
  const publishedDate = new Date(catalog.published_at || catalog.created_at).toLocaleDateString(
    locale === 'bn' ? 'bn-BD' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const fileSizeMB = catalog.file_size
    ? (catalog.file_size / 1024 / 1024).toFixed(1)
    : '3.7'

  // Build viewer URLs
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(catalog.pdf_url)}&embedded=true`
  const activePdfUrl = pdfEngine === 'google' ? googleViewerUrl : catalog.pdf_url

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleResetZoom = () => {
    setZoom(100)
    setPanPosition({ x: 0, y: 0 })
    setFitMode('page')
  }

  const toggleFitMode = () => {
    if (fitMode === 'page') {
      setFitMode('width')
      setZoom(130)
    } else {
      setFitMode('page')
      setZoom(100)
      setPanPosition({ x: 0, y: 0 })
    }
  }

  // Fullscreen management
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        const elem = viewerContainerRef.current
        if (elem) {
          if (elem.requestFullscreen) {
            await elem.requestFullscreen()
          } else if ((elem as any).webkitRequestFullscreen) {
            await (elem as any).webkitRequestFullscreen()
          } else {
            // CSS fallback fullscreen
            setIsFullscreen(true)
          }
        } else {
          setIsFullscreen(true)
        }
      } else {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen()
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen()
          }
        }
        setIsFullscreen(false)
      }
    } catch (err) {
      // In case browser blocks native fullscreen API, toggle CSS fallback
      setIsFullscreen((prev) => !prev)
    }
  }, [isFullscreen])

  // Sync fullscreen state with browser events & Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      setIsFullscreen(isNativeFs)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {})
          }
          setIsFullscreen(false)
        }
      }
      if (e.key === '+' || e.key === '=') {
        if (e.ctrlKey || e.metaKey) return
        handleZoomIn()
      }
      if (e.key === '-') {
        if (e.ctrlKey || e.metaKey) return
        handleZoomOut()
      }
      if (e.key === '0') {
        if (e.ctrlKey || e.metaKey) return
        handleResetZoom()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  // Pan / Drag handlers for cover inspection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'cover' || zoom <= 100) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Download handler with analytics tracking
  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      window.open(`/api/catalogs/download?id=${catalog.id}`, '_blank', 'noopener,noreferrer')
      toast.success(
        locale === 'bn' ? 'ডাউনলোড শুরু হয়েছে' : 'Download Initiated',
        { description: locale === 'bn' ? 'ক্যাটালগ পিডিএফ ফাইল প্রস্তুত হচ্ছে।' : 'Your catalog PDF is downloading.' }
      )
    } catch {
      toast.error(
        locale === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download Failed',
        { description: locale === 'bn' ? 'অনুগ্রহ করে নতুন ট্যাবে খোলার চেষ্টা করুন।' : 'Please try opening in a new tab.' }
      )
    } finally {
      setTimeout(() => setIsDownloading(false), 2000)
    }
  }

  // Share link handler
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} — Rongdhonu Catalog`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopiedLink(true)
        toast.success(locale === 'bn' ? 'লিঙ্ক কপি করা হয়েছে' : 'Link copied to clipboard')
        setTimeout(() => setCopiedLink(false), 2500)
      }
    } catch {
      // User dismissed share dialog
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0908] text-[#F4EEDF] selection:bg-[#F4C662]/30 selection:text-[#F4C662]">
      {/* Background Ambience / Subtle Museum Vignette */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(217, 162, 51, 0.12) 0%, rgba(11, 9, 8, 0) 70%)'
        }}
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 md:pt-28 pb-16">
        
        {/* ============================================================== */}
        {/* SECTION A: ELEGANT EDITORIAL HEADER                            */}
        {/* ============================================================== */}
        <header className="mb-6 md:mb-8 space-y-4">
          
          {/* Top navigation row: Back button & Quick actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
            <Link
              href="/catalogs"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#F4EEDF]/70 hover:text-[#F4C662] transition-colors py-2 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>{locale === 'bn' ? 'ক্যাটালগ আর্কাইভে ফিরুন' : 'Back to Catalogs'}</span>
            </Link>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Share button */}
              <button
                onClick={handleShare}
                type="button"
                className="h-10 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#F4EEDF]/80 hover:text-white transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                title={locale === 'bn' ? 'ক্যাটালগ লিঙ্ক শেয়ার করুন' : 'Share catalog link'}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#33CB9C]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? (locale === 'bn' ? 'কপি হয়েছে' : 'Copied') : (locale === 'bn' ? 'শেয়ার' : 'Share')}</span>
              </button>

              {/* Direct Open in New Tab */}
              <a
                href={catalog.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#F4EEDF]/80 hover:text-white transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                title={locale === 'bn' ? 'নতুন ট্যাবে সম্পূর্ণ পিডিএফ খুলুন' : 'Open original PDF in new tab'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{locale === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open Tab'}</span>
              </a>

              {/* Primary Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                type="button"
                className="h-10 px-4 sm:px-5 rounded-full bg-[#F4C662] hover:bg-[#ebd083] text-[#0B0908] text-xs font-bold tracking-wide transition-all shadow-lg shadow-[#F4C662]/10 hover:shadow-[#F4C662]/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{locale === 'bn' ? 'ডাউনলোড' : 'Download PDF'}</span>
                <span className="hidden md:inline-block text-[11px] opacity-75 font-normal">({fileSizeMB} MB)</span>
              </button>
            </div>
          </div>

          {/* Exhibition context & Title */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pt-2">
            <div className="lg:col-span-8 space-y-2">
              {/* Eyebrow: Exhibition name + Year */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#F4C662]/10 text-[#F4C662] border border-[#F4C662]/20">
                  <Sparkles className="w-3 h-3" />
                  {ex.year} {locale === 'bn' ? 'প্রদর্শনী' : 'Exhibition'}
                </span>
                <span className="text-xs text-[#F4EEDF]/60 font-serif italic">
                  {exhibitionTitle}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#F4EEDF] tracking-tight leading-tight">
                {title}
              </h1>

              {/* Bilingual alternate title if present */}
              {locale === 'en' && catalog.title_bn && (
                <p className="text-sm sm:text-base text-[#F4EEDF]/50 font-serif">
                  {catalog.title_bn}
                </p>
              )}
              {locale === 'bn' && catalog.title_en && catalog.title_en !== catalog.title_bn && (
                <p className="text-sm sm:text-base text-[#F4EEDF]/50 font-serif">
                  {catalog.title_en}
                </p>
              )}

              {/* Description / Curatorial synopsis */}
              {description && (
                <p className="text-sm sm:text-base text-[#F4EEDF]/75 leading-relaxed pt-2 max-w-3xl font-light">
                  {description}
                </p>
              )}
            </div>

            {/* Metadata Pills (Desktop & Tablet right-aligned) */}
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#F4C662]" />
                <span className="text-[#F4EEDF]/60">{locale === 'bn' ? 'ভাষা:' : 'Lang:'}</span>
                <span className="font-semibold text-white uppercase">{catalog.language}</span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#F4C662]" />
                <span className="text-[#F4EEDF]/60">{locale === 'bn' ? 'সংস্করণ:' : 'Ver:'}</span>
                <span className="font-semibold text-white">v{catalog.version}</span>
              </div>

              {catalog.page_count && (
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#F4C662]" />
                  <span className="text-[#F4EEDF]/60">{locale === 'bn' ? 'পৃষ্ঠা:' : 'Pages:'}</span>
                  <span className="font-semibold text-white">{catalog.page_count}</span>
                </div>
              )}

              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <ArrowDownToLine className="w-3.5 h-3.5 text-[#F4C662]" />
                <span className="text-[#F4EEDF]/60">{locale === 'bn' ? 'ডাউনলোড:' : 'Downloads:'}</span>
                <span className="font-semibold text-white">{catalog.total_downloads || 0}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* SECTION B & C: MAIN CATALOG VIEWER CONTAINER & CONTROLS       */}
        {/* ============================================================== */}
        <div
          ref={viewerContainerRef}
          className={`relative flex flex-col bg-[#120F0D] border border-white/15 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[9999] rounded-none border-0 w-screen h-screen'
              : 'w-full min-h-[540px] sm:min-h-[620px] lg:min-h-[740px]'
          }`}
        >
          {/* ────────────────────────────────────────────────────────── */}
          {/* VIEWER TOOLBAR (Accessible, Responsive, 44px Touch Targets) */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3 bg-[#191512]/95 backdrop-blur-xl border-b border-white/10">
            
            {/* Left: View Mode Switcher (Reader vs Cover Plate) */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewMode('reader')
                  setFitMode('page')
                  setZoom(100)
                }}
                className={`min-h-[40px] px-3 sm:px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  viewMode === 'reader'
                    ? 'bg-[#F4C662] text-[#0B0908] shadow-md shadow-[#F4C662]/20'
                    : 'text-[#F4EEDF]/70 hover:text-white hover:bg-white/5'
                }`}
                title={locale === 'bn' ? 'সম্পূর্ণ পিডিএফ রিডার' : 'Interactive Document Reader'}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden xs:inline">{locale === 'bn' ? 'ডকুমেন্ট' : 'Reader'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('cover')
                  setFitMode('page')
                  setZoom(100)
                  setPanPosition({ x: 0, y: 0 })
                }}
                className={`min-h-[40px] px-3 sm:px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  viewMode === 'cover'
                    ? 'bg-[#F4C662] text-[#0B0908] shadow-md shadow-[#F4C662]/20'
                    : 'text-[#F4EEDF]/70 hover:text-white hover:bg-white/5'
                }`}
                title={locale === 'bn' ? 'আর্ট প্লেট ও কভার পরিদর্শন' : 'Artwork Plate & Cover Inspection'}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden xs:inline">{locale === 'bn' ? 'কভার আর্ট' : 'Cover Plate'}</span>
              </button>
            </div>

            {/* Middle: Zoom & Sizing Controls (Works for Desktop & Android) */}
            <div className="flex items-center gap-1 sm:gap-2">
              
              {/* Zoom Buttons Group */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-[#F4EEDF]/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="min-w-[44px] h-10 px-2 flex items-center justify-center text-xs font-mono font-semibold text-[#F4EEDF]/90 hover:text-[#F4C662] transition-colors cursor-pointer"
                  title="Reset Zoom (100%)"
                  aria-label="Current zoom level, click to reset"
                >
                  {zoom}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-[#F4EEDF]/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Fit Width / Fit Page Toggle */}
              <button
                type="button"
                onClick={toggleFitMode}
                className={`w-10 h-10 sm:w-auto sm:px-3 sm:h-10 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  fitMode === 'width'
                    ? 'bg-white/15 border-[#F4C662]/40 text-[#F4C662]'
                    : 'bg-black/40 border-white/10 text-[#F4EEDF]/70 hover:text-white hover:bg-white/5'
                }`}
                title={fitMode === 'page' ? 'Fit to Width' : 'Fit to Page'}
                aria-label={fitMode === 'page' ? 'Fit to Width' : 'Fit to Page'}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden md:inline">{fitMode === 'page' ? 'Fit Page' : 'Fit Width'}</span>
              </button>
            </div>

            {/* Right: Fullscreen & Engine Options */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Reader Engine Switcher (Desktop only when in reader mode) */}
              {viewMode === 'reader' && (
                <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsIframeLoading(true)
                      setPdfEngine('google')
                    }}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pdfEngine === 'google'
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#F4EEDF]/50 hover:text-white'
                    }`}
                  >
                    Google Engine
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsIframeLoading(true)
                      setPdfEngine('direct')
                    }}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pdfEngine === 'direct'
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#F4EEDF]/50 hover:text-white'
                    }`}
                  >
                    Native Engine
                  </button>
                </div>
              )}

              {/* Refresh / Reload viewer button */}
              {viewMode === 'reader' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsIframeLoading(true)
                    setIframeError(false)
                    // Trigger iframe reload by momentarily clearing
                    const prevEngine = pdfEngine
                    setPdfEngine('google')
                    setTimeout(() => setPdfEngine(prevEngine), 50)
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-[#F4EEDF]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Reload viewer"
                  aria-label="Reload viewer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-[#F4EEDF]/70 hover:text-[#F4C662] hover:bg-white/10 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* VIEWER DISPLAY STAGE                                       */}
          {/* ────────────────────────────────────────────────────────── */}
          <div 
            className={`relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[#0B0908] ${
              isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[65vh] sm:h-[72vh] min-h-[500px]'
            }`}
          >
            {/* MODE 1: INTERACTIVE DOCUMENT READER (PDF) */}
            {viewMode === 'reader' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                
                {/* Loading indicator */}
                {isIframeLoading && !iframeError && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B0908] gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#F4C662]" />
                    <p className="text-sm font-serif text-[#F4EEDF]/70">
                      {locale === 'bn' ? 'ক্যাটালগ লোড হচ্ছে...' : 'Loading exhibition catalog document...'}
                    </p>
                    <p className="text-xs text-[#F4EEDF]/40">
                      {locale === 'bn' ? 'অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন' : 'Preparing interactive pages'}
                    </p>
                  </div>
                )}

                {/* PDF Frame */}
                {!iframeError ? (
                  <div
                    className="w-full h-full overflow-auto transition-transform duration-200 origin-center"
                    style={{
                      transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                      transformOrigin: 'top center',
                    }}
                  >
                    <iframe
                      key={`${activePdfUrl}-${pdfEngine}`}
                      src={activePdfUrl}
                      className="w-full h-full border-0 bg-neutral-900"
                      title={`Catalog: ${title}`}
                      onLoad={() => setIsIframeLoading(false)}
                      onError={() => {
                        setIsIframeLoading(false)
                        setIframeError(true)
                      }}
                      loading="eager"
                      allow="fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-downloads allow-forms"
                      style={{
                        minHeight: '100%',
                      }}
                    />
                  </div>
                ) : (
                  /* Fallback when iframe cannot load */
                  <div className="p-8 max-w-lg text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-[#F4C662]" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white">
                      {locale === 'bn' ? 'ডকুমেন্ট প্রিভিউ লোড হতে সমস্যা হয়েছে' : 'Unable to render inline preview'}
                    </h3>
                    <p className="text-sm text-[#F4EEDF]/70 leading-relaxed">
                      {locale === 'bn'
                        ? 'আপনার ব্রাউজার নিরাপত্তা সেটিংস বা নেটওয়ার্ক সংযোগের কারণে এম্বেডেড প্রিভিউ লোড হয়নি। আপনি সরাসরি পিডিএফটি খুলতে বা ডাউনলোড করতে পারেন।'
                        : 'Your browser or network prevented the embedded preview from rendering. You can open the native PDF directly or download it.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <a
                        href={catalog.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-[#F4C662] text-[#0B0908] text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {locale === 'bn' ? 'সরাসরি পিডিএফ খুলুন' : 'Open PDF Directly'}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setIframeError(false)
                          setIsIframeLoading(true)
                          setPdfEngine((p) => (p === 'google' ? 'direct' : 'google'))
                        }}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {locale === 'bn' ? 'বিকল্প ইঞ্জিনে পুনরায় চেষ্টা করুন' : 'Retry with Alternative Engine'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: COVER & ARTWORK PLATE INSPECTION */}
            {viewMode === 'cover' && (
              <div
                className={`relative w-full h-full flex items-center justify-center overflow-hidden p-4 sm:p-8 select-none ${
                  isDragging ? 'cursor-grabbing' : zoom > 100 ? 'cursor-grab' : 'cursor-default'
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Artwork Canvas with Aspect-Preserving Rendering */}
                <div
                  className="relative transition-transform duration-150 ease-out max-w-full max-h-full flex items-center justify-center shadow-2xl"
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={coverImage}
                    alt={title}
                    className="max-h-[60vh] sm:max-h-[68vh] w-auto max-w-full object-contain rounded-lg border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                    draggable={false}
                    onDoubleClick={() => {
                      if (zoom === 100) {
                        setZoom(150)
                      } else {
                        handleResetZoom()
                      }
                    }}
                  />

                  {/* Artwork Plate Scrim & Frame Corner Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider text-white flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3 h-3 text-[#F4C662]" />
                    {locale === 'bn' ? 'কভার প্লেট' : 'Plate No. 01'}
                  </div>
                </div>

                {/* Mobile / Android Touch Pan Hint */}
                {zoom > 100 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] text-[#F4EEDF]/75 pointer-events-none">
                    {locale === 'bn' ? 'স্থান পরিবর্তন করতে ড্র্যাগ করুন' : 'Click & drag to pan zoomed artwork'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* VIEWER FOOTER BAR (Status, Metadata, Mobile Quick Actions) */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="px-4 sm:px-6 py-3 bg-[#151210] border-t border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs text-[#F4EEDF]/70">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-white/90">
                {locale === 'bn' ? 'অফিসিয়াল ডিজিটাল ক্যাটালগ' : 'Official Digital Publication'}
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="hidden sm:inline">
                {locale === 'bn' ? 'আইডি:' : 'ID:'} <span className="font-mono text-white/60">{catalog.id.substring(0, 8)}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <span className="hidden md:inline text-white/40">
                {locale === 'bn' ? 'ফুলস্ক্রিন বন্ধ করতে Esc চাপুন' : 'Press Esc to exit fullscreen'}
              </span>

              {/* Mobile Quick Direct Open Link */}
              <a
                href={catalog.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4C662] hover:underline font-semibold flex items-center gap-1"
              >
                <span>{locale === 'bn' ? 'পিডিএফ রিডারে দেখুন' : 'Native Browser PDF'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION D: RELATED LINKS & CURATORIAL CONTEXT                   */}
        {/* ============================================================== */}
        <section className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#F4C662]/30 transition-all space-y-2">
            <h4 className="font-serif font-bold text-lg text-white">
              {locale === 'bn' ? 'সম্পর্কিত প্রদর্শনী' : 'Associated Exhibition'}
            </h4>
            <p className="text-xs text-[#F4EEDF]/70 leading-relaxed">
              {locale === 'bn'
                ? 'এই ক্যাটালগটি যে প্রদর্শনীর জন্য প্রকাশিত হয়েছিল তার সম্পূর্ণ বিবরণ দেখুন।'
                : 'Explore the full artwork roster and participating artists of this exhibition.'}
            </p>
            <div className="pt-2">
              <Link
                href={`/exhibitions/${ex.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4C662] hover:underline"
              >
                <span>{exhibitionTitle}</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#F4C662]/30 transition-all space-y-2">
            <h4 className="font-serif font-bold text-lg text-white">
              {locale === 'bn' ? 'গ্যালারি অ্যালবাম' : 'Gallery Album'}
            </h4>
            <p className="text-xs text-[#F4EEDF]/70 leading-relaxed">
              {locale === 'bn'
                ? 'এই প্রদর্শনীর সমস্ত শিল্পকর্মের উচ্চ রেজোলিউশন ছবি ও তথ্য ব্রাউজ করুন।'
                : 'View the high-resolution gallery of exhibited paintings, sculptures, and plates.'}
            </p>
            <div className="pt-2">
              <Link
                href={`/gallery?exhibition=${ex.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4C662] hover:underline"
              >
                <span>{locale === 'bn' ? 'গ্যালারি দেখুন' : 'Explore Gallery'}</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#F4C662]/30 transition-all space-y-2">
            <h4 className="font-serif font-bold text-lg text-white">
              {locale === 'bn' ? 'ক্যাটালগ সংগ্রহশালা' : 'Catalog Archive'}
            </h4>
            <p className="text-xs text-[#F4EEDF]/70 leading-relaxed">
              {locale === 'bn'
                ? 'রংধনুর প্রতিটি সংস্করণের অফিসিয়াল ডিজিটাল প্রকাশনা অন্বেষণ করুন।'
                : 'Browse through our complete digital library of curated art exhibition publications.'}
            </p>
            <div className="pt-2">
              <Link
                href="/catalogs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4C662] hover:underline"
              >
                <span>{locale === 'bn' ? 'সকল ক্যাটালগ' : 'All Publications'}</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
