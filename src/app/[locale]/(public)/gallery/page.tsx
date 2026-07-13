import { createClient } from "@/lib/supabase/server"
import { AlbumGrid } from "@/components/public/AlbumGrid"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getCmsContent } from "@/lib/cms/content"
import { Metadata } from 'next'
import { generateDynamicMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const { getCmsContent } = await import('@/lib/cms/content')
  
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhonu'
  const faviconUrl = settingsData?.favicon_url
  
  const seoData = await getCmsContent('gallery', 'seo', locale)
  const seoTitle = seoData?.seo_title || siteName
  const seoDescription = seoData?.meta_description || settingsData?.site_description || ''
  const ogImage = seoData?.og_image || settingsData?.default_og_image || 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200'

  return generateDynamicMetadata({
    title: seoTitle,
    description: seoDescription,
    url: '/gallery',
    imageUrl: ogImage,
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
      videoCount,
      album_type: album.album_type,
      category_slug: album.category_slug,
    }
  })

  // Fetch CMS hero configurations
  const heroData = await getCmsContent('gallery', 'hero', locale)

  const heroTitle = heroData?.title || (locale === 'bn' ? 'প্রদর্শনী অ্যালবাম' : 'Exhibition Albums')
  const heroSubtitle = heroData?.subtitle || (locale === 'bn' 
    ? 'আমাদের প্রদর্শনী ও ইভেন্টের স্মৃতিগুলো অন্বেষণ করুন।' 
    : 'A curated visual journey through our exhibitions, ceremonies, and behind the scenes — every album a room in the museum.')

  return (
    <div className="gallery-page-wrapper">
      <header className="page-hero gallery-page-hero artwork">
        <img 
          src={heroData?.imageUrl || "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=2400&auto=format&fit=crop"} 
          alt="Visitor walking through an illuminated gallery corridor" 
          loading="eager"
        />
        <div className="scrim"></div>
        <div className="frame-edge"></div>
        <div className="page-hero-inner">
          <div className="reveal in">
            <div className="eyebrow center">{locale === 'bn' ? 'ভিজ্যুয়াল আর্কাইভ' : 'Visual Archive'}</div>
            <h1>
              {heroData?.title || (locale === 'bn' ? 'ভিজ্যুয়াল আর্কাইভ' : 'Exhibition Albums')}
            </h1>
            <p className="page-hero-sub">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </header>

      {/* ============ GRID & FILTERS ============ */}
      <Suspense fallback={<div className="flex justify-center p-32 bg-[#0B0908]"><Loader2 className="w-10 h-10 animate-spin text-[#B4233A]" strokeWidth={1} /></div>}>
        <AlbumGrid 
          albums={albums} 
          locale={locale} 
          searchParams={resolvedSearchParams} 
        />
      </Suspense>
    </div>
  )
}
