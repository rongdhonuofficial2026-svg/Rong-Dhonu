import { createClient } from '@/lib/supabase/server'
import { Link } from '@/lib/i18n/routing'
import { Plus, BookOpen, FileText } from 'lucide-react'
import Image from "next/image"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"
import { CatalogSearch } from '@/components/admin/catalogs/CatalogSearch'
import { CatalogFilter } from '@/components/admin/catalogs/CatalogFilter'
import { CatalogDirectoryCard } from '@/components/admin/catalogs/CatalogDirectoryCard'

export default async function AdminCatalogsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { query, status } = await searchParams

  let queryBuilder = supabase
    .from('catalogs')
    .select('*, exhibitions(theme_en, year, hero_image_url)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  if (query) {
    queryBuilder = queryBuilder.ilike('title_en', `%${query}%`)
  }

  const { data: catalogs, error } = await queryBuilder

  if (error) {
    return <div className="p-8 text-destructive">Error loading catalogs: {error.message}</div>
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-16 md:pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[220px] md:min-h-[300px] flex flex-col justify-end p-6 md:p-8 lg:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/catalogs_hero.png" 
            alt="Historical Catalogs" 
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
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium tracking-widest uppercase">Digital Archives</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
              Historical <span className="text-gradient-gold">Catalogs</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Manage the official exhibition catalog documents. Upload, version, and publish historic records of the world's finest artwork.
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Link
              href="/admin/catalogs/new"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-11 h-11 px-6 text-sm font-medium rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-8">
        <GlassPanel intensity="medium" className="p-4 rounded-2xl flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <CatalogSearch />
          <CatalogFilter />
        </GlassPanel>

        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {!catalogs || catalogs.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6 mx-auto">
                <FileText className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-2xl mb-2">No catalogs found</h3>
              <p className="text-muted-foreground mb-8">
                {query || (status && status !== 'all') 
                  ? 'No catalogs match your current search or filter.'
                  : 'Upload the first official catalog for an exhibition.'
                }
              </p>
              {(!query && (!status || status === 'all')) && (
                <Link
                  href="/admin/catalogs/new"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create First Catalog
                </Link>
              )}
            </div>
          ) : (
            catalogs.map((cat: any) => (
              <CatalogDirectoryCard key={cat.id} catalog={cat} />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
