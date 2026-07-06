import { createClient } from "@/lib/supabase/server"
import { Upload, Trash2, Edit2, PlayCircle, Image as ImageIcon, FolderTree } from "lucide-react"
import Image from "next/image"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"

export default async function GalleryManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch gallery media
  const { data: media, error } = await supabase
    .from('gallery_media')
    .select('*, exhibitions(theme_en)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading gallery: {error.message}</div>
  }

  return (
    <div className="space-y-12 pb-20">
      
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
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
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium tracking-widest uppercase">Media Curation</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
              Public <span className="text-gradient-gold">Gallery</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Curate the digital exhibition space. Manage event photography, cinematic video tours, and categorize media to craft the perfect public viewing experience.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <PremiumButton variant="glass" leftIcon={<FolderTree className="w-4 h-4" />}>
              Manage Categories
            </PremiumButton>
            <PremiumButton variant="primary" leftIcon={<Upload className="w-4 h-4" />}>
              Upload Media
            </PremiumButton>
          </div>
        </div>
      </section>

      {/* Media Grid Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">Media Archives</h2>
          <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground/70 uppercase tracking-widest">
            <span>{media?.filter(m => m.media_type === 'image').length || 0} Images</span>
            <span>&bull;</span>
            <span>{media?.filter(m => m.media_type === 'video').length || 0} Videos</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {!media || media.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6 mx-auto">
                <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-2xl mb-2">The gallery is empty</h3>
              <p className="text-muted-foreground">Upload the first pieces of media to begin curating the public exhibition.</p>
            </div>
          ) : (
            media.map((item: any) => (
              <LuxuryCard key={item.id} padding="none" className="overflow-hidden group">
                <div className="relative aspect-[4/3] bg-black cursor-pointer">
                  {item.media_type === 'image' ? (
                    <Image src={item.url} alt={item.caption_en || "Gallery item"} fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-slate-900 text-white group-hover:scale-105 transition-transform duration-700">
                      <PlayCircle className="w-16 h-16 opacity-50 group-hover:opacity-100 group-hover:text-accent transition-all duration-300" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md bg-black/40 text-white border-white/20">
                      {item.category || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Overlay Hover Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="absolute top-4 right-4 flex gap-2 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      <PremiumButton variant="glass" size="icon" className="h-10 w-10 rounded-full backdrop-blur-xl bg-white/10 border-white/20">
                        <Edit2 className="w-4 h-4 text-white" />
                      </PremiumButton>
                      <PremiumButton variant="glass" size="icon" className="h-10 w-10 rounded-full backdrop-blur-xl bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </PremiumButton>
                    </div>
                    
                    <div className="transform translate-y-[10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                      <p className="font-serif text-lg text-white mb-1 line-clamp-1">{item.caption_en || 'Untitled Artifact'}</p>
                      <p className="text-accent text-xs font-mono uppercase tracking-widest">
                        {item.exhibitions?.theme_en || 'General Archive'}
                      </p>
                    </div>
                  </div>
                </div>
              </LuxuryCard>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
