import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AlbumMediaGrid } from "@/components/public/AlbumMediaGrid"
import { Suspense } from "react"
import { Loader2, ArrowLeft, Calendar, Image as ImageIcon } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: album } = await supabase.from('exhibitions').select('theme_en, theme_bn, description_en, description_bn').eq('id', id).maybeSingle()
  
  if (!album) return { title: 'Album Not Found' }

  return {
    title: locale === 'bn' ? `${album.theme_bn} | রঙধনু` : `${album.theme_en} | Rongdhono`,
    description: locale === 'bn' ? album.description_bn : album.description_en,
  }
}

export default async function AlbumPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  let album: any = null
  let initialMedia: any[] = []

  if (id === 'archive') {
    // Construct virtual album for general/independent uploads
    album = {
      id: 'archive',
      theme_en: 'Rongdhono Archive',
      theme_bn: 'রঙধনু আর্কাইভ',
      description_en: 'A collection of general memory albums, ceremonies, behind-the-scenes look and VIP guests.',
      description_bn: 'রঙধনু কার্যক্রম, সাধারণ স্মারক অ্যালবাম, অনুষ্ঠান ও পর্দার আড়ালের দৃশ্যাবলী।',
      exhibition_start: null,
      year: new Date().getFullYear(),
      status: 'published',
      is_deleted: false,
      hero_image_url: null
    }

    const { data: mediaData } = await supabase
      .from('gallery_media')
      .select('*, exhibitions(theme_en, theme_bn, year)')
      .is('exhibition_id', null)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(20)
    
    initialMedia = mediaData || []
    
    // Set hero banner of virtual album to the first media item
    if (initialMedia.length > 0) {
      album.hero_image_url = initialMedia[0].url
    }
  } else {
    const { data: albumData, error: albumError } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (albumError || !albumData || albumData.status !== 'published' || albumData.is_deleted) {
      notFound()
    }
    album = albumData

    const { data: mediaData } = await supabase
      .from('gallery_media')
      .select('*, exhibitions(theme_en, theme_bn, year)')
      .eq('exhibition_id', id)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(20)
      
    initialMedia = mediaData || []
  }

  const title = locale === 'bn' ? album.theme_bn : album.theme_en
  const description = locale === 'bn' ? album.description_bn : album.description_en
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const dateDisplay = formatDate(album.exhibition_start)

  return (
    <main className="min-h-screen pb-32 bg-[#F5F5F0]">
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Album Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-foreground/10 bg-[#1A1A1A]">
        {album.hero_image_url && (
          <div className="absolute inset-0 z-0">
            <img src={album.hero_image_url} alt={title} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent" />
          </div>
        )}
        
        <div className="container relative z-10 mx-auto max-w-7xl pt-10">
          <Button variant="outline" size="sm" asChild className="mb-12 bg-white/10 text-white border-white/20 hover:bg-white hover:text-black transition-colors rounded-full">
            <Link href="/gallery">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'bn' ? 'সকল অ্যালবামে ফিরে যান' : 'Back to Albums'}
            </Link>
          </Button>
          
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-black text-xs font-bold uppercase tracking-widest rounded-sm">
              <ImageIcon className="w-3.5 h-3.5" />
              {locale === 'bn' ? 'অ্যালবাম' : 'Album'}
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-xl">
              {title}
            </h1>
            
            <div className="flex items-center gap-2 text-white/70 font-medium">
              <Calendar className="w-4 h-4 text-accent" />
              <span>{dateDisplay || album.year}</span>
            </div>

            {description && (
              <p className="text-xl text-white/80 font-light max-w-2xl leading-relaxed mt-6">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-[1600px] pt-16 relative z-20">
        <Suspense fallback={<div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin text-accent" strokeWidth={1} /></div>}>
          <AlbumMediaGrid 
            initialMedia={initialMedia || []} 
            locale={locale} 
            exhibitionId={id} 
          />
        </Suspense>
      </div>
    </main>
  )
}
