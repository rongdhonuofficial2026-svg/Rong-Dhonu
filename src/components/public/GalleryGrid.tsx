 
 
'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, Filter, X, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "@/lib/i18n/routing"

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
    // Reset state when initial properties change, avoiding direct effect setting
    // But since this is a Nextjs component, changing searchParams creates a new initialArtworks
    // so we sync them in a safe way:
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

  return (
    <div className="space-y-12">
      {/* Horizontal Elegant Filters */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-6 -mx-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 w-full no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground whitespace-nowrap">Exhibition:</span>
            <div className="flex gap-2">
              <Button 
                variant={(searchParams.exhibition || 'all') === 'all' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => updateFilter('exhibition', 'all')}
                className="rounded-full text-xs"
              >
                All
              </Button>
              {exhibitions.map(ex => (
                <Button 
                  key={ex.id}
                  variant={searchParams.exhibition === ex.id ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => updateFilter('exhibition', ex.id)}
                  className="rounded-full text-xs whitespace-nowrap"
                >
                  {ex.year}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-4 w-[1px] bg-border hidden md:block" />
          
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground whitespace-nowrap">Category:</span>
            <div className="flex gap-2">
              {['all', 'painting', 'sculpture', 'photography', 'digital'].map(cat => (
                <Button 
                  key={cat}
                  variant={(searchParams.category || 'all') === cat ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => updateFilter('category', cat)}
                  className="rounded-full text-xs capitalize whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {(!!searchParams.exhibition || !!searchParams.category) && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs rounded-full shrink-0">
            <X className="w-3 h-3 mr-1"/> Clear
          </Button>
        )}
      </div>

      {/* Masonry Grid */}
      <div className="w-full">
        {artworks.length === 0 ? (
          <div className="py-32 text-center border border-border/50 bg-muted/5 flex flex-col items-center justify-center">
            <Filter className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-2xl font-bold mb-2">No artworks found</h3>
            <p className="text-muted-foreground text-lg max-w-md">Try adjusting your filters to discover more masterpieces.</p>
            <Button variant="outline" className="mt-8 rounded-none tracking-widest uppercase" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
            {artworks.map((art) => (
              <div 
                key={art.id} 
                className="relative break-inside-avoid group cursor-pointer overflow-hidden bg-card"
                onClick={() => setSelectedImage(art)}
              >
                {art.main_image_url && (
                  <Image 
                    src={art.main_image_url} 
                    alt={art.title_en} 
                    width={800} 
                    height={800} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-white/10 hover:bg-white/30 text-white border-0 backdrop-blur-md transition-colors">
                      <ZoomIn className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="font-serif text-2xl font-bold leading-tight line-clamp-2 drop-shadow-md">
                      {locale === 'bn' && art.title_bn ? art.title_bn : art.title_en}
                    </p>
                    <p className="text-sm text-white/90 font-light mt-1 tracking-wide line-clamp-1 drop-shadow-md">
                      {locale === 'bn' && art.profiles?.full_name_bn ? art.profiles.full_name_bn : `${art.profiles?.first_name_en} ${art.profiles?.last_name_en}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center p-12">
            {isLoading && <Loader2 className="w-8 h-8 animate-spin text-foreground" />}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-0 bg-black/95 backdrop-blur-2xl flex flex-col md:flex-row shadow-2xl rounded-none">
          {selectedImage && (
            <>
              <div className="relative flex-1 bg-transparent flex items-center justify-center p-4 md:p-12">
                <Image 
                  src={selectedImage.main_image_url} 
                  alt={selectedImage.title_en} 
                  fill 
                  className="object-contain drop-shadow-2xl" 
                  sizes="100vw"
                  quality={100}
                  priority
                />
              </div>
              <div className="w-full md:w-[400px] bg-black/50 border-l border-white/10 p-10 flex flex-col text-slate-100 shrink-0 overflow-y-auto">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="font-serif text-3xl font-bold leading-tight">
                    {locale === 'bn' && selectedImage.title_bn ? selectedImage.title_bn : selectedImage.title_en}
                  </h3>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setSelectedImage(null)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="space-y-6 text-sm text-white/70 flex-1 font-light tracking-wide">
                  <div>
                    <span className="block text-white/40 text-xs uppercase tracking-widest mb-1">Artist</span>
                    <span className="font-serif text-white text-xl">
                      {locale === 'bn' && selectedImage.profiles?.full_name_bn ? selectedImage.profiles.full_name_bn : `${selectedImage.profiles?.first_name_en} ${selectedImage.profiles?.last_name_en}`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-xs uppercase tracking-widest mb-1">Medium</span>
                    <span className="text-base">{locale === 'bn' && selectedImage.medium_bn ? selectedImage.medium_bn : selectedImage.medium_en}</span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-xs uppercase tracking-widest mb-1">Dimensions</span>
                    <span className="text-base">{selectedImage.dimensions || 'Unknown'}</span>
                  </div>
                  {selectedImage.price && (
                    <div>
                      <span className="block text-white/40 text-xs uppercase tracking-widest mb-1">Price</span>
                      <span className="text-emerald-400/90 font-medium text-lg">৳{selectedImage.price}</span>
                    </div>
                  )}
                  {selectedImage.description_en && (
                    <div className="pt-6 mt-6 border-t border-white/10">
                      <p className="line-clamp-6 leading-relaxed">{locale === 'bn' && selectedImage.description_bn ? selectedImage.description_bn : selectedImage.description_en}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/10">
                  <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-none h-14 tracking-widest uppercase text-xs font-bold" asChild>
                    <Link href={`/gallery/artwork/${selectedImage.id}`}>
                      View Full Details
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
