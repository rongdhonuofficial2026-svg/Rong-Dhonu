import { createClient } from "@/lib/supabase/server"
import { createClient as createStaticClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { AlbumMediaGrid } from "@/components/public/AlbumMediaGrid"
import { Suspense } from "react"
import { Loader2, ArrowLeft, Calendar, Image as ImageIcon } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let album: any = null

  if (isUuid) {
    const { data } = await supabase.from('gallery_albums').select('*').eq('id', id).maybeSingle()
    album = data
    if (!album) {
      const { data: bySlug } = await supabase.from('gallery_albums').select('*').eq('slug', id).maybeSingle()
      album = bySlug
    }
  } else {
    const { data } = await supabase.from('gallery_albums').select('*').eq('slug', id).maybeSingle()
    album = data
  }

  if (!album) return { title: 'Album Not Found' }

  const title = album.seo_title || (locale === 'bn' ? (album.title_bn || album.title_en) : album.title_en)
  const description = album.seo_description || (locale === 'bn' ? album.description_bn : album.description_en)
  const ogImage = album.og_image_url || null

  return {
    title: locale === 'bn' ? `${title} | রঙধনু` : `${title} | Rongdhonu`,
    description,
    openGraph: ogImage ? {
      images: [{ url: ogImage }]
    } : undefined
  }
}

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return []

  const supabase = createStaticClient(supabaseUrl, supabaseAnonKey)
  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('id, slug')
    .eq('status', 'published')

  if (!albums) return []

  const params: { locale: string; id: string }[] = []
  const locales = ['en', 'bn']

  for (const locale of locales) {
    for (const album of albums) {
      params.push({ locale, id: album.id })
      params.push({ locale, id: album.slug })
    }
  }

  return params
}

export default async function AlbumPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  // Resolve album by id or slug. Exhibition album slugs are UUID strings,
  // so we must try both id AND slug when the input looks like a UUID.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let album: any = null
  let albumError: any = null

  if (isUuid) {
    // Try by id first
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    albumError = error
    album = data

    // If not found by id, try by slug (exhibition albums use exhibition UUID as slug)
    if (!album && !error) {
      const { data: bySlug, error: slugError } = await supabase
        .from('gallery_albums')
        .select('*')
        .eq('slug', id)
        .maybeSingle()
      albumError = slugError
      album = bySlug
    }
  } else {
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('slug', id)
      .maybeSingle()
    albumError = error
    album = data
  }

  if (albumError || !album || album.status !== 'published') {
    notFound()
  }

  const { data: mediaData } = await supabase
    .from('gallery_media')
    .select('*, exhibitions:gallery_media_exhibition_id_fkey(theme_en, theme_bn, year)')
    .eq('gallery_album_id', album.id)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)
      
  const initialMedia = mediaData || []

  // Resolve cover image for hero banner following priority hierarchy
  let heroImage = '/images/album_placeholder.png'
  if (album.cover_media_id) {
    const explicitCover = initialMedia.find(m => m.id === album.cover_media_id)
    if (explicitCover) heroImage = explicitCover.url
  }
  if (heroImage === '/images/album_placeholder.png' && initialMedia.length > 0) {
    const featured = initialMedia.find(m => m.is_featured === true || m.featured === true)
    if (featured) heroImage = featured.url
    else {
      const firstImg = initialMedia.find(m => m.media_type === 'image')
      if (firstImg) heroImage = firstImg.url
    }
  }

  const title = locale === 'bn' ? (album.title_bn || album.title_en) : album.title_en
  const description = locale === 'bn' ? album.description_bn : album.description_en
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const dateDisplay = formatDate(album.created_at)

  return (
    <div className="gallery-page-wrapper">
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Album Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-white/[0.08] bg-[#0A0A0A]">
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <img src={heroImage} alt={title} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908] via-[#0B0908]/85 to-transparent" />
          </div>
        )}
        
        <div className="container relative z-10 mx-auto max-w-7xl pt-10">
          <Button variant="outline" size="sm" asChild className="mb-12 bg-white/5 text-[#F4EEDF] border-white/10 hover:bg-[#F4EEDF] hover:text-black transition-colors rounded-full">
            <Link href="/gallery">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'bn' ? 'সকল অ্যালবামে ফিরে যান' : 'Back to Albums'}
            </Link>
          </Button>
          
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4C662] text-black text-[10px] font-bold uppercase tracking-widest rounded-sm">
              <ImageIcon className="w-3.5 h-3.5" />
              {locale === 'bn' ? 'অ্যালবাম' : 'Album'}
            </div>
            
            <h1 className="album-detail-title">
              {title}
            </h1>
            
            <div className="flex items-center gap-2 text-[#F4EEDF]/70 font-medium">
              <Calendar className="w-4 h-4 text-[#F4C662]" />
              <span>{dateDisplay || album.year}</span>
            </div>

            {description && (
              <p className="text-xl text-[#F4EEDF]/80 font-light max-w-2xl leading-relaxed mt-6">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-[1600px] pt-16 relative z-20">
        <Suspense fallback={<div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin text-[#F4C662]" strokeWidth={1} /></div>}>
          <AlbumMediaGrid 
            initialMedia={initialMedia || []} 
            locale={locale} 
            albumId={album.id} 
          />
        </Suspense>
      </div>
    </div>
  )
}
