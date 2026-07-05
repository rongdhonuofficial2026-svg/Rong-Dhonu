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

  // Also fetch exhibitions and categories for the filter sidebar/dropdowns
  const { data: filterExhibitions } = await supabase.from('exhibitions').select('id, year, title_en, title_bn').order('year', { ascending: false })

  return (
    <main className="min-h-screen py-12 px-4 md:px-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col items-center justify-center space-y-4 mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold">
          {locale === 'bn' ? 'আর্ট গ্যালারি' : 'Art Gallery'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {locale === 'bn' ? 'আমাদের শিল্পীদের তৈরি সেরা শিল্পকর্মগুলো এক্সপ্লোর করুন।' : 'Discover the finest works created by our brilliant artists.'}
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
        <GalleryGrid 
          initialArtworks={initialArtworks || []} 
          locale={locale} 
          exhibitions={filterExhibitions || []} 
          searchParams={resolvedSearchParams} 
        />
      </Suspense>
    </main>
  )
}
