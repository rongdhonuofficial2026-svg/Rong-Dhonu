 
 
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
    <div className="space-y-8 flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0 space-y-6 sticky top-24">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</h2>
          {(!!searchParams.exhibition || !!searchParams.category) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8">Clear</Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Exhibition Year</label>
            <Select value={(searchParams.exhibition as string) || 'all'} onValueChange={(v) => updateFilter('exhibition', v)}>
              <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {exhibitions.map(ex => (
                  <SelectItem key={ex.id} value={ex.id}>{ex.year} - {locale === 'bn' && ex.title_bn ? ex.title_bn : ex.title_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Category</label>
            <Select value={(searchParams.category as string) || 'all'} onValueChange={(v) => updateFilter('category', v)}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="sculpture">Sculpture</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="digital">Digital Art</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="flex-1 w-full">
        {artworks.length === 0 ? (
          <div className="py-24 text-center border border-dashed rounded-xl border-border bg-muted/10">
            <p className="text-muted-foreground text-lg">No artworks found matching your filters.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 pb-20">
            {artworks.map((art) => (
              <div 
                key={art.id} 
                className="relative break-inside-avoid mb-4 group cursor-pointer overflow-hidden rounded-xl bg-muted"
                onClick={() => setSelectedImage(art)}
              >
                {art.main_image_url && (
                  <Image 
                    src={art.main_image_url} 
                    alt={art.title_en} 
                    width={500} 
                    height={500} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-lg bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur-sm">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-lg leading-tight line-clamp-2">
                      {locale === 'bn' && art.title_bn ? art.title_bn : art.title_en}
                    </p>
                    <p className="text-sm text-white/80 line-clamp-1">
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
          <div ref={observerTarget} className="flex justify-center p-8">
            {isLoading && <Loader2 className="w-8 h-8 animate-spin text-accent" />}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 border-0 bg-black overflow-hidden flex flex-col md:flex-row shadow-2xl">
          {selectedImage && (
            <>
              <div className="relative flex-1 bg-black/90 flex items-center justify-center min-h-[50vh]">
                <Image 
                  src={selectedImage.main_image_url} 
                  alt={selectedImage.title_en} 
                  fill 
                  className="object-contain" 
                  sizes="100vw"
                  quality={90}
                />
              </div>
              <div className="w-full md:w-80 bg-slate-950 p-6 flex flex-col text-slate-100 shrink-0 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-serif text-2xl font-bold">
                    {locale === 'bn' && selectedImage.title_bn ? selectedImage.title_bn : selectedImage.title_en}
                  </h3>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setSelectedImage(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-4 text-sm text-slate-300 flex-1">
                  <div>
                    <span className="block text-slate-500 mb-1">Artist</span>
                    <span className="font-medium text-white text-base">
                      {locale === 'bn' && selectedImage.profiles?.full_name_bn ? selectedImage.profiles.full_name_bn : `${selectedImage.profiles?.first_name_en} ${selectedImage.profiles?.last_name_en}`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Medium</span>
                    <span>{locale === 'bn' && selectedImage.medium_bn ? selectedImage.medium_bn : selectedImage.medium_en}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Dimensions</span>
                    <span>{selectedImage.dimensions || 'Unknown'}</span>
                  </div>
                  {selectedImage.price && (
                    <div>
                      <span className="block text-slate-500 mb-1">Price</span>
                      <span className="text-emerald-400 font-medium font-mono">৳{selectedImage.price}</span>
                    </div>
                  )}
                  {selectedImage.description_en && (
                    <div className="pt-4 border-t border-slate-800">
                      <p className="line-clamp-4">{locale === 'bn' && selectedImage.description_bn ? selectedImage.description_bn : selectedImage.description_en}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-800">
                  <Button className="w-full" asChild>
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
