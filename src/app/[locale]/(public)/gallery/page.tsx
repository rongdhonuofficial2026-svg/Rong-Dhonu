import { createClient } from "@/lib/supabase/server"
import { AlbumGrid } from "@/components/public/AlbumGrid"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getCmsContent } from "@/lib/cms/content"

import { generateDynamicMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhono'
  const faviconUrl = settingsData?.favicon_url

  return generateDynamicMetadata({
    title: locale === 'bn' ? 'অ্যালবাম' : 'Albums',
    description: locale === 'bn' ? 'রঙধনু প্রদর্শনী ও ইভেন্টের মেমরি অ্যালবাম।' : 'Explore curated memory albums from Rongdhono exhibitions and events.',
    url: '/gallery',
    locale,
    siteName,
    faviconUrl,
  })
}

export default async function AlbumsPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<any> }) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const supabase = await createClient()

  // Fetch published albums along with their media to compute counts and cover images
  const { data: dbAlbums, error: albumErr } = await supabase
    .from('gallery_albums')
    .select(`
      *,
      gallery_media:gallery_media!gallery_media_gallery_album_id_fkey (
        id,
        media_type,
        status,
        url,
        is_featured,
        featured
      )
    `)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (albumErr) {
    return <div className="p-8 text-destructive">Error loading gallery: {albumErr.message}</div>
  }

  // Process albums for the frontend grid mapping Cover overrides and fallbacks
  const albums = (dbAlbums || []).map(album => {
    const publishedMedia = album.gallery_media?.filter((m: any) => m.status === 'published') || []
    const photoCount = publishedMedia.filter((m: any) => m.media_type === 'image').length
    const videoCount = publishedMedia.filter((m: any) => m.media_type === 'video').length

    // Determine cover URL by Priority: cover_media_id -> featured -> first uploaded image
    let coverUrl: string | null = null
    if (album.cover_media_id) {
      const explicitCover = publishedMedia.find((m: any) => m.id === album.cover_media_id)
      if (explicitCover) coverUrl = explicitCover.url
    }
    
    if (!coverUrl) {
      // Find featured image
      const featured = publishedMedia.find((m: any) => m.is_featured === true || m.featured === true)
      if (featured) coverUrl = featured.url
    }
    
    if (!coverUrl) {
      // Fallback to first uploaded image
      const firstImg = publishedMedia.find((m: any) => m.media_type === 'image')
      if (firstImg) coverUrl = firstImg.url
    }

    return {
      id: album.id,
      slug: album.slug,
      theme_en: album.title_en,
      theme_bn: album.title_bn || album.title_en,
      description_en: album.description_en,
      description_bn: album.description_bn,
      hero_image_url: coverUrl,
      exhibition_start: album.created_at,
      exhibition_end: null,
      year: album.created_at ? new Date(album.created_at).getFullYear() : new Date().getFullYear(),
      photoCount,
      videoCount
    }
  })

  // Fetch CMS hero configurations
  const heroData = await getCmsContent('gallery', 'hero', locale);

  const heroTitle = heroData?.title || (locale === 'bn' ? 'প্রদর্শনী অ্যালবাম' : 'Exhibition Albums');
  const heroSubtitle = heroData?.subtitle || (locale === 'bn' 
    ? 'আমাদের প্রদর্শনী ও ইভেন্টের স্মৃতিগুলো অন্বেষণ করুন।' 
    : 'A curated visual journey through our exhibitions, ceremonies, and behind the scenes.');

  return (
    <main className="min-h-screen pb-32 bg-[#EFE6D2]">
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Minimal Editorial Hero */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-[#DCCFAE]">
        <div className="absolute inset-0 z-0 bg-[#EFE6D2]" />
        
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F4C662]/5 rounded-full blur-[100px] mix-blend-multiply translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl space-y-8 text-center mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#1E1A16] leading-[1.1]">
              {heroTitle}
            </h1>
            <div className="w-16 h-[1.5px] bg-[#DCCFAE] mx-auto" />
            <p className="text-xl md:text-2xl text-[#5C5347] font-light max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-[1600px] pt-12 relative z-20">
        <Suspense fallback={<div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin text-[#B4233A]" strokeWidth={1} /></div>}>
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
