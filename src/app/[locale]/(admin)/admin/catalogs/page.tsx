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
    <div className="space-y-12 pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
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
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
              Historical <span className="text-gradient-gold">Catalogs</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Manage the official exhibition catalog documents. Upload, version, and publish historic records of the world's finest artwork.
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Link
              href="/admin/catalogs/new"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-8">
        <GlassPanel intensity="medium" className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
          <CatalogSearch />
          <CatalogFilter />
        </GlassPanel>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <LuxuryCard key={cat.id} padding="none" className="overflow-hidden group h-[380px] flex flex-col">
                <div className="relative h-40 w-full shrink-0">
                  <Image 
                    src={coverImage} 
                    alt={cat.title_en}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {cat.status === 'published' ? (
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5 shadow-xl">
                        <CheckCircle className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5 shadow-xl">
                        <Clock className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 relative z-10 flex flex-col flex-1 mt-[-60px]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-black border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xl backdrop-blur-md">
                      <FileText className="w-6 h-6 text-amber-400/80" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1 pr-2">
                      <h3 className="font-serif font-bold text-xl text-foreground line-clamp-1 group-hover:text-gradient-gold transition-all duration-500">
                        {cat.title_en}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mt-1">
                        <span className="uppercase tracking-widest font-mono text-[10px] border border-white/10 px-2 py-0.5 rounded text-white/50">{cat.language}</span>
                        <span className="uppercase tracking-widest font-mono text-[10px] border border-white/10 px-2 py-0.5 rounded text-white/50">v{cat.version}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 mb-4 flex-1">
                    <p className="text-sm text-muted-foreground/80 line-clamp-1">
                      Exhibition: {exhibition?.theme_en || 'Unknown'} ({exhibition?.year})
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {cat.file_size ? (cat.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown Size'} • {new Date(cat.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Stats & Meta */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-6 text-sm text-muted-foreground/80">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1 flex items-center gap-1.5"><ArrowDownToLine className="w-3 h-3"/> Downloads</span>
                        <span className="font-medium text-foreground">{cat.total_downloads || 0}</span>
                      </div>
                    </div>
                    
                    {cat.published_at && (
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">Published Date</span>
                        <span className="text-xs text-foreground font-mono">{new Date(cat.published_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Actions Footer */}
                <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 p-3 flex gap-2 absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <CatalogActions catalog={cat} />
                </div>
              </LuxuryCard>
            )})
          )}
        </div>
      </section>
    </div>
  )
}
