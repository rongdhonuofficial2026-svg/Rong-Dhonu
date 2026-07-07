import { createClient } from '@/lib/supabase/server'
import { CatalogForm } from '@/components/admin/catalogs/CatalogForm'
import { BookOpen } from 'lucide-react'

export default async function NewCatalogPage({ searchParams }: { searchParams: Promise<{ exhibition_id?: string }> }) {
  const supabase = await createClient()
  const { exhibition_id } = await searchParams

  // Fetch ALL exhibitions — we now support multiple catalogs/versions per exhibition
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('id, theme_en, theme_bn, year')
    .order('year', { ascending: false })

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 w-max mb-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium tracking-widest uppercase">New Catalog</span>
        </div>
        <h1 className="font-serif text-4xl font-bold text-shadow-elegant">
          Archive <span className="text-gradient-gold">Exhibition Catalog</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Upload an official PDF catalog for an exhibition. Each exhibition supports multiple catalog versions.
        </p>
      </div>

      <CatalogForm exhibitions={exhibitions || []} defaultExhibitionId={exhibition_id} />
    </div>
  )
}
