'use client'

import * as React from "react"
import { createPortal } from "react-dom"
import { createClient } from "@/lib/supabase/client"
import { Loader2, X, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react"

export function AlbumMediaGrid({ initialMedia, locale, albumId }: { initialMedia: any[], locale: string, albumId: string }) {
  const [media, setMedia] = React.useState(initialMedia)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(initialMedia.length === 20)
  const [page, setPage] = React.useState(1)
  
  // Lightbox selection by index for seamless keyboard and arrow navigation
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  // Mounted guard — ensures createPortal is only called after client-side hydration
  const [mounted, setMounted] = React.useState(false)
  
  const supabase = createClient()

  // Intersection Observer for Infinite Scroll
  const observerTarget = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setMedia(initialMedia)
    setPage(1)
    setHasMore(initialMedia.length === 20)
    setSelectedIndex(null)
  }, [initialMedia])

  const loadMore = React.useCallback(async () => {
    setIsLoading(true)
    const next = page + 1
    const from = (next - 1) * 20
    const to = from + 19

    const query = supabase
      .from('gallery_media')
      .select('*, exhibitions:gallery_media_exhibition_id_fkey(theme_en, theme_bn, year)')
      .eq('status', 'published')
      .eq('gallery_album_id', albumId)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data } = await query

    if (data && data.length > 0) {
      setMedia(prev => [...prev, ...data])
      setPage(next)
      setHasMore(data.length === 20)
    } else {
      setHasMore(false)
    }
    setIsLoading(false)
  }, [page, albumId, supabase])

  React.useEffect(() => {
    const currentTarget = observerTarget.current
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [hasMore, isLoading, loadMore])

  const selectedItem = selectedIndex !== null ? media[selectedIndex] : null

  const handleNext = React.useCallback(() => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }, [selectedIndex, media.length])

  const handlePrev = React.useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }, [selectedIndex])

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') setSelectedIndex(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, handleNext, handlePrev])

  return (
    <div style={{ background: 'var(--color-void)', paddingBottom: '150px' }}>
      {/* Masonry Grid */}
      <div className="w-full">
        {media.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center">
            <h3 className="font-serif text-3xl font-medium mb-3 text-[#F4EEDF]">
              {locale === 'bn' ? 'কোনো মিডিয়া পাওয়া যায়নি' : 'No media found'}
            </h3>
            <p className="text-[#F4EEDF]/60 text-lg max-w-md font-light">
              {locale === 'bn' ? 'এই অ্যালবামে এখনও কোনো মিডিয়া যোগ করা হয়নি।' : 'This album does not have any media yet.'}
            </p>
          </div>
        ) : (
          <div className="masonry">
            {media.map((item, index) => {
              const title = locale === 'bn' && item.title_bn ? item.title_bn : (item.title_en || 'Untitled')
              const dateDisplay = item.created_at ? new Date(item.created_at).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', year: 'numeric' }) : ''

              const categoryTag = locale === 'bn' ? 'আর্টওয়ার্ক' : 'Artwork'

              // Derive intrinsic aspect ratio if dimensions are available in metadata
              const itemAspectRatio = (item.width && item.height && item.width > 0 && item.height > 0)
                ? `${item.width} / ${item.height}`
                : undefined

              return (
                <div 
                  key={item.id} 
                  className="masonry-tile artwork reveal in group cursor-pointer"
                  style={itemAspectRatio ? { aspectRatio: itemAspectRatio } : undefined}
                  onClick={() => setSelectedIndex(index)}
                >
                  {item.media_type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.alt_text || title} 
                      loading="lazy"
                      width={item.width || undefined}
                      height={item.height || undefined}
                      className="w-full h-auto block"
                    />
                  ) : (
                    <div className="relative w-full aspect-video bg-black/40">
                      <video src={item.url} className="w-full h-full object-cover opacity-80" muted playsInline loop />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <PlayCircle className="w-16 h-16 text-white/50 group-hover:text-accent transition-colors duration-300 drop-shadow-xl" strokeWidth={1.5} />
                      </div>
                    </div>
                  )}
                  <div className="scrim"></div>
                  <div className="frame-edge"></div>
                  <div className="masonry-expand">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                      <path d="M8 3H3v5M17 8V3h-5M3 12v5h5M12 17h5v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="wall-label">
                    <span className="no">{categoryTag}</span>
                    <b>{title}</b>
                    <span>{item.exhibitions ? `${item.exhibitions.theme_en} · ${item.exhibitions.year}` : dateDisplay}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center p-16">
            {isLoading && <Loader2 className="w-8 h-8 animate-spin text-white/40" strokeWidth={1.5} />}
          </div>
        )}
      </div>

      {/* Immersive Lightbox via Portal — no Radix Dialog conflicts */}
      {mounted && selectedIndex !== null && selectedItem && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="lightbox open fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0908]/94 backdrop-blur-md"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close Button */}
          <button
            className="lightbox-close absolute top-8 right-8 z-50 w-[44px] h-[44px] border border-white/14 rounded-full flex items-center justify-center text-[#F4EEDF] hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIndex(null)
            }}
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev Button */}
          {selectedIndex > 0 && (
            <button
              className="absolute left-8 z-50 p-3 rounded-full bg-white/5 hover:bg-white/20 text-[#F4EEDF]/70 hover:text-[#F4EEDF] transition-all"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Main Media Display */}
          <div
            className="relative max-w-[86vw] max-h-[80vh] flex items-center justify-center rounded-sm overflow-hidden"
            style={{ boxShadow: '0 60px 100px -30px rgba(0,0,0,.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.media_type === 'image' ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.alt_text || selectedItem.title_en || 'Gallery Image'}
                style={{ maxWidth: '86vw', maxHeight: '80vh', objectFit: 'contain' }}
              />
            ) : (
              <video
                key={selectedItem.id}
                src={selectedItem.url}
                controls
                autoPlay
                style={{ maxWidth: '86vw', maxHeight: '80vh', objectFit: 'contain' }}
              />
            )}
          </div>

          {/* Next Button */}
          {selectedIndex < media.length - 1 && (
            <button
              className="absolute right-8 z-50 p-3 rounded-full bg-white/5 hover:bg-white/20 text-[#F4EEDF]/70 hover:text-[#F4EEDF] transition-all"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Caption Overlay */}
          <div
            className="lightbox-caption absolute bottom-[44px] left-1/2 -translate-x-1/2 text-center text-[#F4EEDF] max-w-xl px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <b className="block font-serif text-lg md:text-xl font-bold mb-1">
              {locale === 'bn' && selectedItem.title_bn ? selectedItem.title_bn : (selectedItem.title_en || 'Untitled')}
            </b>
            <span className="text-xs text-[#F4EEDF]/46 tracking-wide">
              {selectedItem.exhibitions ? `${selectedItem.exhibitions.theme_en} · ${selectedItem.exhibitions.year}` : ''}
              {selectedItem.photographer ? ` · Photographer: ${selectedItem.photographer}` : ''}
            </span>
            {(selectedItem.description_en || selectedItem.caption_en) && (
              <p className="text-xs text-[#F4EEDF]/72 leading-relaxed mt-2 max-h-[60px] overflow-y-auto">
                {locale === 'bn'
                  ? (selectedItem.description_bn || selectedItem.caption_bn)
                  : (selectedItem.description_en || selectedItem.caption_en)}
              </p>
            )}
          </div>

          {/* Preload Next Image */}
          {selectedIndex < media.length - 1 && media[selectedIndex + 1].media_type === 'image' && (
            <img src={media[selectedIndex + 1].url} className="hidden" alt="preload-next" />
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
