import { createClient } from "@/lib/supabase/server"
import { ModerationTable } from "@/components/admin/ModerationTable"
import Image from "next/image"

export default async function ArtworkModerationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch pending artworks by default, but fetch everything to allow filtering in client
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles!artist_id (
        first_name_en, last_name_en, phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading artworks: {error.message}</div>
  }

  return (
    <div className="space-y-12 pb-20">
      
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/moderation_hero.png" 
            alt="Moderation Studio" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase">Appraisal Studio</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
            Curatorial <span className="text-gradient-gold">Review</span>
          </h1>
          <p className="text-white/80 text-lg font-light">
            Examine, appraise, and moderate submitted masterpieces before they enter the public gallery. Maintain the high standards of Rongdhono.
          </p>
        </div>
      </section>

      {/* Moderation Interface */}
      <section>
        <ModerationTable artworks={artworks || []} locale={locale} />
      </section>
      
    </div>
  )
}
