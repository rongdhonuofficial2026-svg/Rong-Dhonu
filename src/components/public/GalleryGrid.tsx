'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, X, ZoomIn, Filter, PlayCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { cn } from "@/lib/utils"
import { GALLERY_CATEGORIES } from "@/types/gallery"

export function GalleryGrid({ initialMedia, locale, exhibitions, searchParams }: { initialMedia: any[], locale: string, exhibitions: any[], searchParams: any }) {
  const [media, setMedia] = React.useState(initialMedia)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(initialMedia.length === 20)
  const [page, setPage] = React.useState(1)
  const [selectedItem, setSelectedItem] = React.useState<Record<string, any> | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Intersection Observer for Infinite Scroll
  const observerTarget = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMedia(initialMedia)
    setPage(1)
    setHasMore(initialMedia.length === 20)
  }, [initialMedia])

  const loadMore = React.useCallback(async () => {
    setIsLoading(true)
    const next = page + 1
    const from = (next - 1) * 20
    const to = from + 19

    let query = supabase
      .from('gallery_media')
      .select('*, exhibitions(title_en, title_bn, year)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (searchParams.exhibition) query = query.eq('exhibition_id', searchParams.exhibition)
    if (searchParams.category) query = query.eq('category', searchParams.category)

    const { data } = await query
    if (data && data.length > 0) {
      setMedia(prev => [...prev, ...data])
      setPage(next)
      setHasMore(data.length === 20)
    } else {
      setHasMore(false)
    }
    setIsLoading(false)
  }, [page, searchParams, supabase])

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

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.replace(pathname, { scroll: false })
  }

  // Broken grid height pattern
  const HEIGHT_PATTERN = [
    "h-[300px]", "h-[450px]", "h-[400px]", "h-[500px]", "h-[350px]"
  ]

  return (
    <div className="space-y-16">
      {/* Horizontal Elegant Filters with Glass Effect */}
      <div className="sticky top-[72px] z-30 bg-[#F5F5F0]/80 backdrop-blur-xl border-b border-foreground/5 py-6 px-6 -mx-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 overflow-x-auto pb-4 md:pb-0 w-full no-scrollbar">
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40 whitespace-nowrap">Exhibition</span>
            <div className="flex gap-2">
              <Button 
                variant={(searchParams.exhibition || 'all') === 'all' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => updateFilter('exhibition', 'all')}
                className={cn(
                  "rounded-full text-xs transition-all duration-300 border-0",
                  (searchParams.exhibition || 'all') === 'all' ? "bg-foreground text-background shadow-lg" : "bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground hover:shadow-md"
                )}
              >
                All
              </Button>
              {exhibitions.map(ex => (
                <Button 
                  key={ex.id}
                  variant={searchParams.exhibition === ex.id ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => updateFilter('exhibition', ex.id)}
                  className={cn(
                    "rounded-full text-xs whitespace-nowrap transition-all duration-300 border-0",
                    searchParams.exhibition === ex.id ? "bg-foreground text-background shadow-lg" : "bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground hover:shadow-md"
                  )}
                >
                  {ex.year}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-foreground/10 hidden md:block" />
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40 whitespace-nowrap">Category</span>
            <div className="flex gap-2">
              <Button 
                variant={(searchParams.category || 'all') === 'all' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => updateFilter('category', 'all')}
                className={cn(
                  "rounded-full text-xs capitalize whitespace-nowrap transition-all duration-300 border-0",
                  (searchParams.category || 'all') === 'all' ? "bg-foreground text-background shadow-lg" : "bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground hover:shadow-md"
                )}
              >
                All
              </Button>
              {GALLERY_CATEGORIES.map(cat => (
                <Button 
                  key={cat}
                  variant={searchParams.category === cat ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => updateFilter('category', cat)}
                  className={cn(
                    "rounded-full text-xs capitalize whitespace-nowrap transition-all duration-300 border-0",
                    searchParams.category === cat ? "bg-foreground text-background shadow-lg" : "bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground hover:shadow-md"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {(!!searchParams.exhibition || !!searchParams.category) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[10px] uppercase tracking-widest font-bold rounded-full shrink-0 hover:bg-foreground/5">
            <X className="w-3 h-3 mr-2"/> Clear Filters
          </Button>
        )}
      </div>

      {/* Masonry Grid */}
      <div className="w-full">
        {media.length === 0 ? (
          <div className="py-32 text-center border-t border-b border-foreground/10 flex flex-col items-center justify-center">
            <Filter className="w-12 h-12 text-foreground/20 mb-6" strokeWidth={1} />
            <h3 className="font-serif text-3xl font-medium mb-3">No media found</h3>
            <p className="text-foreground/60 text-lg max-w-md font-light">Adjust your curated filters to discover more media.</p>
            <Button variant="outline" className="mt-10 rounded-full tracking-widest uppercase text-xs h-12 px-8" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 pb-20">
            {media.map((item, index) => {
              const heightClass = item.is_featured ? "h-[600px] sm:col-span-2" : HEIGHT_PATTERN[index % HEIGHT_PATTERN.length]
              
              const title = locale === 'bn' && item.title_bn ? item.title_bn : (item.title_en || 'Untitled')
              const caption = locale === 'bn' && item.caption_bn ? item.caption_bn : item.caption_en

              return (
                <div 
                  key={item.id} 
                  className={cn("relative break-inside-avoid group cursor-pointer overflow-hidden bg-[#1A1A1A] shadow-lg rounded-sm", heightClass)}
                  onClick={() => setSelectedItem(item)}
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
                      <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
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
                      <div className="flex items-center gap-3 justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-white/70 font-semibold bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">
                          {item.category}
                        </span>
                        {item.exhibitions && (
                          <span className="text-sm text-white/90 font-light drop-shadow-md truncate max-w-[200px]">
                            {item.exhibitions.year} Exhibition
                          </span>
                        )}
                      </div>
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
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-0 bg-black/95 backdrop-blur-2xl flex flex-col md:flex-row shadow-2xl rounded-none">
          {selectedItem && (
            <>
              <div className="relative flex-1 bg-transparent flex items-center justify-center p-4 md:p-12 overflow-hidden">
                {selectedItem.media_type === 'image' ? (
                  <PremiumImage 
                    src={selectedItem.url} 
                    fallbackSrc="/images/placeholders/artwork-1.webp"
                    alt={selectedItem.alt_text || selectedItem.title_en || 'Gallery Image'} 
                    fill
                    className="object-contain drop-shadow-2xl" 
                  />
                ) : (
                  <video src={selectedItem.url} controls autoPlay className="w-full h-full object-contain drop-shadow-2xl outline-none" />
                )}
              </div>
              <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0A0A0A] border-l border-white/10 p-8 md:p-12 flex flex-col text-white shrink-0 overflow-y-auto">
                <div className="flex justify-between items-start mb-12">
                  <h3 className="font-serif text-3xl md:text-4xl font-bold leading-tight drop-cap text-white">
                    {locale === 'bn' && selectedItem.title_bn ? selectedItem.title_bn : (selectedItem.title_en || 'Untitled')}
                  </h3>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full ml-4 shrink-0" onClick={() => setSelectedItem(null)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="space-y-8 text-sm text-white/80 flex-1 font-light tracking-wide">
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Category</span>
                    <span className="text-lg">{selectedItem.category}</span>
                  </div>
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
                      <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Exhibition</span>
                      <span className="text-lg">{selectedItem.exhibitions.year} - {locale === 'bn' && selectedItem.exhibitions.title_bn ? selectedItem.exhibitions.title_bn : selectedItem.exhibitions.title_en}</span>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
