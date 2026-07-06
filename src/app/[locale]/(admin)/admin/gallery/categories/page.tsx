import { createClient } from "@/lib/supabase/server"
import { CategoryManager } from "@/components/admin/gallery/CategoryManager"

export const metadata = {
  title: 'Manage Gallery Categories | Admin',
}

export default async function GalleryCategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('gallery_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return <div className="p-8 text-destructive">Error loading categories: {error.message}</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-serif">Gallery Categories</h2>
      </div>
      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
