import { createClient } from "@/lib/supabase/server"
import { AlbumGrid } from "@/components/public/AlbumGrid"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'bn' ? 'অ্যালবাম | রঙধনু' : 'Albums | Rongdhono',
    description: locale === 'bn' ? 'রঙধনু প্রদর্শনী ও ইভেন্টের মেমরি অ্যালবাম।' : 'Explore curated memory albums from Rongdhono exhibitions and events.',
  }
}

export default async function AlbumsPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<any> }) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const supabase = await createClient()

  // Fetch published exhibitions (Albums) and their media to calculate counts
  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select(`
      *,
      gallery_media (
        id,
        media_type,
        status
      )
    `)
    .in('status', ['ongoing', 'archived'])
    .neq('is_deleted', true)
    .order('year', { ascending: false })
    .order('exhibition_start', { ascending: false })

  // Process data for the frontend
  const albums = (exhibitions || []).map(ex => {
    const publishedMedia = ex.gallery_media?.filter((m: any) => m.status === 'published') || []
    return {
      ...ex,
      photoCount: publishedMedia.filter((m: any) => m.media_type === 'image').length,
      videoCount: publishedMedia.filter((m: any) => m.media_type === 'video').length,
      // We don't need to send the full media array to the client for this view
      gallery_media: undefined
    }
  })

  // Fetch independent media (not linked to any exhibition)
  const { data: independentMedia } = await supabase
    .from('gallery_media')
    .select('id, media_type, status, url')
    .is('exhibition_id', null)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (independentMedia && independentMedia.length > 0) {
    const photoCount = independentMedia.filter((m: any) => m.media_type === 'image').length
    const videoCount = independentMedia.filter((m: any) => m.media_type === 'video').length
    
    albums.unshift({
      id: 'archive',
      theme_en: 'Rongdhono Archive',
      theme_bn: 'রঙধনু আর্কাইভ',
      description_en: 'A collection of general memory albums, ceremonies, behind-the-scenes look and VIP guests.',
      description_bn: 'রঙধনু কার্যক্রম, সাধারণ স্মারক অ্যালবাম, অনুষ্ঠান ও পর্দার আড়ালের দৃশ্যাবলী।',
      hero_image_url: independentMedia[0]?.url || null,
      exhibition_start: null,
      exhibition_end: null,
      year: new Date().getFullYear(),
      photoCount,
      videoCount
    })
  }

  return (
    <main className="min-h-screen pb-32 bg-[#F5F5F0]">
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Minimal Editorial Hero */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-foreground/10">
        <div className="absolute inset-0 z-0 bg-[#F5F5F0]" />
        
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] mix-blend-multiply translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl space-y-8 text-center mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {locale === 'bn' ? 'প্রদর্শনী অ্যালবাম' : 'Exhibition Albums'}
            </h1>
            <div className="w-16 h-[1px] bg-foreground/20 mx-auto" />
            <p className="text-xl md:text-2xl text-foreground/70 font-light max-w-2xl mx-auto leading-relaxed">
              {locale === 'bn' 
                ? 'আমাদের প্রদর্শনী ও ইভেন্টের স্মৃতিগুলো অন্বেষণ করুন।' 
                : 'A curated visual journey through our exhibitions, ceremonies, and behind the scenes.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-[1600px] pt-12 relative z-20">
        <Suspense fallback={<div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin text-accent" strokeWidth={1} /></div>}>
          <AlbumGrid 
            albums={albums} 
            locale={locale} 
            searchParams={resolvedSearchParams} 
          />
        </Suspense>
      </div>
    </main>
  )
}
