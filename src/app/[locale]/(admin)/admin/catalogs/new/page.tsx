import { createClient } from '@/lib/supabase/server'
import { CatalogForm } from '@/components/admin/CatalogForm'
import { notFound } from 'next/navigation'

export default async function NewCatalogPage() {
  const supabase = await createClient()
  
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('id, theme_en, year')
    .order('year', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Upload Catalog Document</h1>
      <CatalogForm exhibitions={exhibitions || []} />
    </div>
  )
}
