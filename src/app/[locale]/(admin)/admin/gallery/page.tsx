import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { ImageIcon } from "lucide-react"
import { GalleryManager } from "@/components/admin/gallery/GalleryManager"

export default async function GalleryManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch gallery media (admin sees all including drafts and archived)
  const { data: media, error: mediaErr } = await supabase
    .from('gallery_media')
    .select(`
      *,
      exhibitions (
        theme_en,
        theme_bn,
        year
      )
    `)
    .order('created_at', { ascending: false })

  const { data: categories, error: catErr } = await supabase
    .from('gallery_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: exhibitions, error: exErr } = await supabase
    .from('exhibitions')
    .select('id, theme_en, theme_bn, year, status')
    .neq('is_deleted', true)
    .order('year', { ascending: false })

  if (mediaErr || catErr || exErr) {
    return <div className="p-8 text-destructive">Error loading gallery: {mediaErr?.message || catErr?.message || exErr?.message}</div>
  }

  return (
    <div className="space-y-12 pb-20">
      
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[250px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/gallery_hero.png" 
            alt="Gallery Curation" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium tracking-widest uppercase">Media Curation</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
            Gallery <span className="text-gradient-gold">Management</span>
          </h1>
          <p className="text-white/80 text-lg font-light max-w-2xl">
            Upload, curate, and organize the digital assets. Every change here instantly updates the public exhibition space.
          </p>
        </div>
      </section>

      {/* Main Interactive Manager */}
      <GalleryManager 
        initialMedia={media || []} 
        categories={categories || []} 
        exhibitions={exhibitions || []} 
      />

    </div>
  )
}
