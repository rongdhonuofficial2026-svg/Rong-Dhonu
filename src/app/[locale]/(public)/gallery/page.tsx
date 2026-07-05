import { createClient } from "@/lib/supabase/server"
import { GalleryGrid } from "@/components/public/GalleryGrid"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'bn' ? 'গ্যালারি | রঙধনু' : 'Gallery | Rongdhono',
    description: locale === 'bn' ? 'রঙধনু বার্ষিক চারুকলা প্রদর্শনীর শিল্পকর্ম গ্যালারি।' : 'Explore the stunning artworks from the Rongdhono Annual Fine Arts Exhibition.',
  }
}

export default async function GalleryPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<any> }) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const supabase = await createClient()

  // Initial fetch for the first page
  let query = supabase
    .from('artworks')
    .select('*, profiles!inner(first_name_en, last_name_en, full_name_bn), exhibitions!inner(year)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)

  // Apply filters if any
  if (resolvedSearchParams.exhibition) query = query.eq('exhibition_id', resolvedSearchParams.exhibition)
  if (resolvedSearchParams.artist) query = query.eq('artist_id', resolvedSearchParams.artist)
  if (resolvedSearchParams.category) query = query.eq('category', resolvedSearchParams.category)

  const { data: initialArtworks, error } = await query

  // Also fetch exhibitions for the filter sidebar/dropdowns
  const { data: filterExhibitions } = await supabase.from('exhibitions').select('id, year, title_en, title_bn').order('year', { ascending: false })

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
              {locale === 'bn' ? 'আর্ট গ্যালারি' : 'The Gallery'}
            </h1>
            <div className="w-16 h-[1px] bg-foreground/20 mx-auto" />
            <p className="text-xl md:text-2xl text-foreground/70 font-light max-w-2xl mx-auto leading-relaxed">
              {locale === 'bn' 
                ? 'আমাদের শিল্পীদের তৈরি সেরা শিল্পকর্মগুলো এক্সপ্লোর করুন।' 
                : 'A curated collection of masterpieces shaping the contemporary art discourse.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-[1600px] pt-12 relative z-20">
        <Suspense fallback={<div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin text-accent" strokeWidth={1} /></div>}>
          <GalleryGrid 
            initialArtworks={initialArtworks || []} 
            locale={locale} 
            exhibitions={filterExhibitions || []} 
            searchParams={resolvedSearchParams} 
          />
        </Suspense>
      </div>
    </main>
  )
}
