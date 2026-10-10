import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { CatalogPreviewView } from '@/components/public/catalogs/CatalogPreviewView'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: catalog } = await supabase
    .from('catalogs')
    .select('*, exhibitions(theme_en, hero_image_url)')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (!catalog) {
    return { title: 'Catalog Not Found' }
  }

  const title = catalog.title_en || 'Catalog'
  const description = catalog.description_en || 'Official Exhibition Catalog'
  const image = catalog.cover_image_url || (catalog.exhibitions as any)?.hero_image_url || '/images/catalogs_hero.png'

  return {
    title: `${title} | Rongdhonu Art Gallery`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [image]
    }
  }
}

export default async function CatalogDetailPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: catalog, error } = await supabase
    .from('catalogs')
    .select('*, exhibitions(*)')
    .eq('id', id)
    .eq('status', 'published') // CRITICAL: Only allow published catalogs
    .maybeSingle()

  if (error || !catalog || !catalog.exhibitions) {
    notFound()
  }

  // Lazy sync the exhibition lifecycle
  const { syncExhibitionLifecycle } = await import('@/lib/exhibition-lifecycle')
  const syncedEx = await syncExhibitionLifecycle(catalog.exhibitions, supabase)
  if (syncedEx) catalog.exhibitions = syncedEx

  const ex = catalog.exhibitions as any
  if (ex.status === 'draft' || ex.status === 'upcoming') {
    notFound()
  }

  return (
    <CatalogPreviewView 
      catalog={catalog as any} 
      locale={locale} 
    />
  )
}
