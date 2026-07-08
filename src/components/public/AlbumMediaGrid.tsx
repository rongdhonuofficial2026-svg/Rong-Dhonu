'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, X, PlayCircle, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { cn } from "@/lib/utils"

export function AlbumMediaGrid({ initialMedia, locale, albumId }: { initialMedia: any[], locale: string, albumId: string }) {
  const [media, setMedia] = React.useState(initialMedia)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(initialMedia.length === 20)
  const [page, setPage] = React.useState(1)
  
  // Lightbox selection by index for seamless keyboard and arrow navigation
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  
  const supabase = createClient()

  // Intersection Observer for Infinite Scroll
  const observerTarget = React.useRef<HTMLDivElement>(null)

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

  const HEIGHT_PATTERN = [
    "h-[300px]", "h-[450px]", "h-[400px]", "h-[500px]", "h-[350px]"
  ]

  return (
    <div className="space-y-16">
      {/* Masonry Grid */}
      <div className="w-full">
        {media.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center">
            <h3 className="font-serif text-3xl font-medium mb-3">
              {locale === 'bn' ? 'কোনো মিডিয়া পাওয়া যায়নি' : 'No media found'}
            </h3>
            <p className="text-foreground/60 text-lg max-w-md font-light">
              {locale === 'bn' ? 'এই অ্যালবামে এখনও কোনো মিডিয়া যোগ করা হয়নি।' : 'This album does not have any media yet.'}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 pb-20">
            {media.map((item, index) => {
              const heightClass = item.is_featured ? "h-[600px] sm:col-span-2" : HEIGHT_PATTERN[index % HEIGHT_PATTERN.length]
              
              const title = locale === 'bn' && item.title_bn ? item.title_bn : (item.title_en || 'Untitled')

              return (
                <div 
                  key={item.id} 
                  className={cn("relative break-inside-avoid group cursor-pointer overflow-hidden bg-[#1A1A1A] shadow-lg rounded-sm", heightClass)}
                  onClick={() => setSelectedIndex(index)}
                >
                  {item.media_type === 'image' ? (
                    <PremiumImage 
                      src={item.url} 
                      fallbackSrc="/images/placeholders/artwork-1.webp"
                      alt={item.alt_text || title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out opacity-90 group-hover:opacity-100" 
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s] ease-out" muted playsInline loop />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <PlayCircle className="w-16 h-16 text-white/50 group-hover:text-accent transition-colors duration-300 drop-shadow-xl" strokeWidth={1.5} />
                      </div>
                    </div>
                  )}
                  
                  {item.is_featured && (
                     <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-accent text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-md">
                       <Star className="w-3 h-3 fill-black" />
                       Featured
                     </div>
                  )}
                  
                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-8 flex flex-col justify-end">
                    <div className="text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <p className="font-serif text-2xl font-bold leading-tight drop-shadow-md mb-2">
                        {title}
                      </p>
                      {item.exhibitions && (
                        <div className="flex items-center gap-3 justify-between">
                          <span className="text-sm text-white/90 font-light drop-shadow-md truncate max-w-[200px]">
                            {item.exhibitions.year} {locale === 'bn' ? 'প্রদর্শনী' : 'Exhibition'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center p-16">
            {isLoading && <Loader2 className="w-8 h-8 animate-spin text-foreground/40" strokeWidth={1.5} />}
          </div>
        )}
      </div>

      {/* Immersive Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-0 bg-black/95 backdrop-blur-2xl flex flex-col md:flex-row shadow-2xl rounded-none">
          {selectedIndex !== null && selectedItem && (
            <>
              {/* Media Viewport Container */}
              <div className="relative flex-1 bg-transparent flex items-center justify-center p-4 md:p-12 overflow-hidden group">
                
                {/* Arrow Navigation Left */}
                {selectedIndex > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="absolute left-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}

                {/* Main Asset Display */}
                {selectedItem.media_type === 'image' ? (
                  <PremiumImage 
                    src={selectedItem.url} 
                    fallbackSrc="/images/placeholders/artwork-1.webp"
                    alt={selectedItem.alt_text || selectedItem.title_en || 'Gallery Image'} 
                    fill
                    className="object-contain drop-shadow-2xl image-reveal" 
                  />
                ) : (
                  <video 
                    key={selectedItem.id}
                    src={selectedItem.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain drop-shadow-2xl outline-none" 
                  />
                )}

                {/* Arrow Navigation Right */}
                {selectedIndex < media.length - 1 && (
                  <button 
                    onClick={handleNext}
                    className="absolute right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}
              </div>

              {/* Sidebar metadata details panel */}
              <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0A0A0A] border-l border-white/10 p-8 md:p-12 flex flex-col text-white shrink-0 overflow-y-auto">
                <div className="flex justify-between items-start mb-12">
                  <h3 className="font-serif text-3xl md:text-4xl font-bold leading-tight drop-cap text-white">
                    {locale === 'bn' && selectedItem.title_bn ? selectedItem.title_bn : (selectedItem.title_en || 'Untitled')}
                  </h3>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full ml-4 shrink-0" onClick={() => setSelectedIndex(null)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="space-y-8 text-sm text-white/80 flex-1 font-light tracking-wide">
                  {selectedItem.photographer && (
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Photographer / Credit</span>
                      <span className="font-serif text-white text-2xl">
                        {selectedItem.photographer}
                      </span>
                    </div>
                  )}
                  {selectedItem.exhibitions && (
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Exhibition Album</span>
                      <span className="text-lg">
                        {selectedItem.exhibitions.year} - {locale === 'bn' && selectedItem.exhibitions.theme_bn ? selectedItem.exhibitions.theme_bn : selectedItem.exhibitions.theme_en}
                      </span>
                    </div>
                  )}
                  {(selectedItem.description_en || selectedItem.caption_en) && (
                    <div className="pt-8 mt-8 border-t border-white/10">
                      <p className="leading-relaxed opacity-90 whitespace-pre-wrap">
                        {locale === 'bn' 
                          ? (selectedItem.description_bn || selectedItem.caption_bn) 
                          : (selectedItem.description_en || selectedItem.caption_en)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preload Next Image Assets cleanly (avoiding browser blocking) */}
              {selectedIndex < media.length - 1 && media[selectedIndex + 1].media_type === 'image' && (
                <img src={media[selectedIndex + 1].url} className="hidden" alt="preload-next" />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
