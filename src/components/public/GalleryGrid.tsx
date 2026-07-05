'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, X, ZoomIn, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { cn } from "@/lib/utils"

export function GalleryGrid({ initialArtworks, locale, exhibitions, searchParams }: { initialArtworks: any[], locale: string, exhibitions: any[], searchParams: any }) {
  const [artworks, setArtworks] = React.useState(initialArtworks)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(initialArtworks.length === 20)
  const [page, setPage] = React.useState(1)
  const [selectedImage, setSelectedImage] = React.useState<Record<string, any> | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Intersection Observer for Infinite Scroll
  const observerTarget = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setArtworks(initialArtworks)
    setPage(1)
    setHasMore(initialArtworks.length === 20)
  }, [initialArtworks])

  const loadMore = React.useCallback(async () => {
    setIsLoading(true)
    const next = page + 1
    const from = (next - 1) * 20
    const to = from + 19

    let query = supabase
      .from('artworks')
      .select('*, profiles!inner(first_name_en, last_name_en, full_name_bn), exhibitions!inner(year)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (searchParams.exhibition) query = query.eq('exhibition_id', searchParams.exhibition)
    if (searchParams.category) query = query.eq('category', searchParams.category)

    const { data } = await query
    if (data && data.length > 0) {
      setArtworks(prev => [...prev, ...data])
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

  // To create a broken grid/masonry feel, we assign alternating height classes
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
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40 whitespace-nowrap">Medium</span>
            <div className="flex gap-2">
              {['all', 'painting', 'sculpture', 'photography', 'digital'].map(cat => (
                <Button 
                  key={cat}
                  variant={(searchParams.category || 'all') === cat ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => updateFilter('category', cat)}
                  className={cn(
                    "rounded-full text-xs capitalize whitespace-nowrap transition-all duration-300 border-0",
                    (searchParams.category || 'all') === cat ? "bg-foreground text-background shadow-lg" : "bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground hover:shadow-md"
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
        {artworks.length === 0 ? (
          <div className="py-32 text-center border-t border-b border-foreground/10 flex flex-col items-center justify-center">
            <Filter className="w-12 h-12 text-foreground/20 mb-6" strokeWidth={1} />
            <h3 className="font-serif text-3xl font-medium mb-3">No artworks found</h3>
            <p className="text-foreground/60 text-lg max-w-md font-light">Adjust your curated filters to discover more masterpieces.</p>
            <Button variant="outline" className="mt-10 rounded-full tracking-widest uppercase text-xs h-12 px-8" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 pb-20">
            {artworks.map((art, index) => {
              const heightClass = HEIGHT_PATTERN[index % HEIGHT_PATTERN.length]
              const fallbackIdx = (index % 6) + 1

              return (
                <div 
                  key={art.id} 
                  className={cn("relative break-inside-avoid group cursor-pointer overflow-hidden bg-[#1A1A1A] shadow-lg rounded-sm", heightClass)}
                  onClick={() => setSelectedImage(art)}
                >
                  <PremiumImage 
                    src={art.main_image_url} 
                    fallbackSrc={`/images/placeholders/artwork-${fallbackIdx}.webp`}
                    alt={art.title_en} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out opacity-90 group-hover:opacity-100" 
                  />
                  
                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-8 flex flex-col justify-between">
                    <div className="flex justify-end transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <p className="font-serif text-3xl font-bold leading-tight drop-shadow-md mb-2">
                        {locale === 'bn' && art.title_bn ? art.title_bn : art.title_en}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-widest text-white/70 font-semibold">Artist</span>
                        <span className="text-sm text-white/90 font-light drop-shadow-md">
                          {locale === 'bn' && art.profiles?.full_name_bn ? art.profiles.full_name_bn : `${art.profiles?.first_name_en} ${art.profiles?.last_name_en}`}
                        </span>
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
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-0 bg-black/95 backdrop-blur-2xl flex flex-col md:flex-row shadow-2xl rounded-none">
          {selectedImage && (
            <>
              <div className="relative flex-1 bg-transparent flex items-center justify-center p-4 md:p-12 overflow-hidden">
                <PremiumImage 
                  src={selectedImage.main_image_url} 
                  fallbackSrc="/images/placeholders/artwork-1.webp"
                  alt={selectedImage.title_en} 
                  fill
                  className="object-contain drop-shadow-2xl" 
                />
              </div>
              <div className="w-full md:w-[450px] bg-[#0A0A0A] border-l border-white/10 p-12 flex flex-col text-white shrink-0 overflow-y-auto">
                <div className="flex justify-between items-start mb-12">
                  <h3 className="font-serif text-4xl font-bold leading-tight drop-cap text-white">
                    {locale === 'bn' && selectedImage.title_bn ? selectedImage.title_bn : selectedImage.title_en}
                  </h3>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setSelectedImage(null)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="space-y-8 text-sm text-white/80 flex-1 font-light tracking-wide">
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Artist</span>
                    <span className="font-serif text-white text-2xl">
                      {locale === 'bn' && selectedImage.profiles?.full_name_bn ? selectedImage.profiles.full_name_bn : `${selectedImage.profiles?.first_name_en} ${selectedImage.profiles?.last_name_en}`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Medium</span>
                    <span className="text-lg">{locale === 'bn' && selectedImage.medium_bn ? selectedImage.medium_bn : selectedImage.medium_en}</span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Dimensions</span>
                    <span className="text-lg">{selectedImage.dimensions || 'Unknown'}</span>
                  </div>
                  {selectedImage.price && (
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Price</span>
                      <span className="text-accent font-serif text-2xl">৳{selectedImage.price}</span>
                    </div>
                  )}
                  {selectedImage.description_en && (
                    <div className="pt-8 mt-8 border-t border-white/10">
                      <p className="leading-relaxed opacity-90">{locale === 'bn' && selectedImage.description_bn ? selectedImage.description_bn : selectedImage.description_en}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10">
                  <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none h-14 tracking-[0.2em] uppercase text-[10px] font-bold transition-colors" asChild>
                    <Link href={`/gallery/artwork/${selectedImage.id}`}>
                      View Full Exhibition Details
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
