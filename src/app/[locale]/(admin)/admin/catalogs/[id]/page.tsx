import { createClient } from '@/lib/supabase/server'
import { CatalogForm } from '@/components/admin/catalogs/CatalogForm'
import { BookOpen } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: catalog, error } = await supabase
    .from('catalogs')
    .select('*, exhibitions(theme_en, theme_bn, year)')
    .eq('id', id)
    .single()

  if (error || !catalog) {
    notFound()
  }

  // Pass only the exhibition associated with this catalog, since it can't be changed to another one
  const exhibitions = [
    {
      id: catalog.exhibition_id,
      theme_en: catalog.exhibitions?.theme_en,
      theme_bn: catalog.exhibitions?.theme_bn,
      year: catalog.exhibitions?.year
    }
  ]

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 w-max mb-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium tracking-widest uppercase">Edit Catalog</span>
        </div>
        <h1 className="font-serif text-4xl font-bold text-shadow-elegant">
          Update <span className="text-gradient-gold">Exhibition Catalog</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Modify the catalog metadata or replace the PDF file.
        </p>
      </div>

      <CatalogForm exhibitions={exhibitions} initialData={catalog} />
    </div>
  )
}
