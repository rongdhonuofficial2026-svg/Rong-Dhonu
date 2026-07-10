import { createClient } from '@/lib/supabase/server'
import { Link } from '@/lib/i18n/routing'
import { Plus, FileText, CheckCircle, Clock, BookOpen, ArrowDownToLine } from 'lucide-react'
import Image from "next/image"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"
import { CatalogActions } from '@/components/admin/catalogs/CatalogActions'
import { CatalogSearch } from '@/components/admin/catalogs/CatalogSearch'
import { CatalogFilter } from '@/components/admin/catalogs/CatalogFilter'

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
            catalogs.map((cat: any) => {
              const exhibition = cat.exhibitions as any;
              const coverImage = cat.cover_image_url || exhibition?.hero_image_url || '/images/catalogs_hero.png';
              
              return (
                <div 
                  key={cat.id} 
                  className="flex flex-col bg-[#171717]/90 border border-white/[0.08] hover:border-white/[0.16] rounded-[24px] overflow-hidden shadow-xl shadow-black/25 hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Top Area: Cover Artwork & Status */}
                  <div className="relative h-52 w-full overflow-hidden shrink-0">
                    <Image 
                      src={coverImage} 
                      alt={cat.title_en}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {cat.status === 'published' ? (
                        <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1 shadow-md">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1 shadow-md">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </div>

                    {/* Catalog Icon overlapping bottom border */}
                    <div className="absolute -bottom-5 left-6 w-10 h-10 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/40 z-20">
                      <FileText className="w-5 h-5 text-[#C9A227]" />
                    </div>
                  </div>

                  {/* Middle Content Area */}
                  <div className="pt-8 px-6 pb-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-serif font-bold text-lg text-white leading-snug tracking-wide line-clamp-2 group-hover:text-[#C9A227] transition-colors duration-300">
                        {cat.title_en}
                      </h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-1">
                        {exhibition?.theme_en || 'Unknown Exhibition'} ({exhibition?.year || '—'})
                      </p>

                      {/* Structured Metadata Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] font-mono border-t border-b border-white/[0.04] py-3.5 my-4">
                        <div className="flex justify-between border-r border-white/[0.04] pr-4">
                          <span className="text-white/40">VERSION</span>
                          <span className="text-white/80 font-semibold">v{cat.version}</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-white/40">LANG</span>
                          <span className="text-white/80 font-semibold uppercase">{cat.language}</span>
                        </div>
                        <div className="flex justify-between border-r border-white/[0.04] pr-4">
                          <span className="text-white/40">SIZE</span>
                          <span className="text-white/80 font-semibold">
                            {cat.file_size ? (cat.file_size / 1024 / 1024).toFixed(2) + ' MB' : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span className="text-white/40">DOWNLOADS</span>
                          <span className="text-white/80 font-semibold">{cat.total_downloads || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Area: Dates & Actions */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-white/35 uppercase tracking-wider mb-4 px-1 shrink-0">
                      <span>Created: {new Date(cat.created_at).toLocaleDateString()}</span>
                      {cat.published_at && (
                        <span>Published: {new Date(cat.published_at).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04] w-full mt-auto shrink-0">
                      <CatalogActions catalog={cat} />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
