import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { BookOpen, Calendar, Globe, ArrowDownToLine, Eye, FileText, Search } from 'lucide-react'
import { CatalogDownloadButton } from '@/components/public/catalogs/CatalogDownloadButton'
import { PublicCatalogSearchFilter } from '@/components/public/catalogs/PublicCatalogSearchFilter'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Navigation' })
  
  return {
    title: `${t('catalogs')} | Rongdhono Art Gallery`,
    description: 'Browse every official Rongdhono exhibition catalog. Discover each exhibition through beautifully curated digital publications that preserve our artistic journey.',
    openGraph: {
      title: `${t('catalogs')} | Rongdhono Art Gallery`,
      description: 'Explore the official exhibition catalog archive of Rongdhono.',
      type: 'website',
      images: ['/images/catalogs_hero.png']
    }
  }
}

export default async function PublicCatalogsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; year?: string; sort?: string }>
}) {
  const { locale } = await params
  const { q, year, sort } = await searchParams
  const supabase = await createClient()

  // Build the query
  let query = supabase
    .from('catalogs')
    .select('*, exhibitions!inner(theme_en, theme_bn, year, hero_image_url)')
    .eq('status', 'published')

  // Search filter
  if (q) {
    query = query.or(`title_en.ilike.%${q}%,title_bn.ilike.%${q}%,exhibitions.theme_en.ilike.%${q}%`)
  }

  // Sorting
  if (sort === 'oldest') {
    query = query.order('published_at', { ascending: true })
  } else {
    // Default newest first
    query = query.order('published_at', { ascending: false })
  }

  const { data: catalogs, error } = await query

  // Client-side year filtering because Supabase joined columns filtering can be tricky if we want all years for the dropdown
  // First get all unique years for the dropdown (from ALL published catalogs)
  const { data: allCatalogs } = await supabase
    .from('catalogs')
    .select('exhibitions!inner(year)')
    .eq('status', 'published')

  const uniqueYears = Array.from(new Set(allCatalogs?.map(c => (c.exhibitions as any).year).filter(Boolean) as number[])).sort((a, b) => b - a)

  // Then filter the fetched results by year if selected
  const filteredCatalogs = catalogs?.filter(cat => {
    if (!year || year === 'all') return true
    return (cat.exhibitions as any).year.toString() === year
  }) || []

  const isSearchEmpty = filteredCatalogs.length === 0 && (q || (year && year !== 'all'))
  const isTotallyEmpty = filteredCatalogs.length === 0 && !q && (!year || year === 'all')

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/catalogs_hero.png" 
            alt="Catalogs Hero" 
            fill 
            className="object-cover object-center opacity-40 dark:opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary mb-6">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-widest uppercase">Digital Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight">
            Exhibition Catalog Archive
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Browse every official Rongdhono exhibition catalog. Discover each exhibition through beautifully curated digital publications that preserve our artistic journey.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Search & Filters */}
        {!isTotallyEmpty && (
          <PublicCatalogSearchFilter years={uniqueYears} />
        )}

        {/* Empty States */}
        {isTotallyEmpty ? (
          <div className="text-center py-32 bg-muted/20 rounded-3xl border border-dashed flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center mb-6 shadow-sm border">
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-3">The Archive is Empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              No official exhibition catalogs have been published yet. Please check back after our upcoming exhibitions to explore our digital publications.
            </p>
          </div>
        ) : isSearchEmpty ? (
          <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-sm border">
              <Search className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">No Results Found</h2>
            <p className="text-muted-foreground">
              We couldn't find any catalogs matching your current search criteria. Try adjusting your filters or search terms.
            </p>
            <Link href="/catalogs" className="mt-6 text-primary hover:underline font-medium">
              Clear all filters
            </Link>
          </div>
        ) : (
          /* Catalog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCatalogs.map((cat) => {
              const ex = cat.exhibitions as any
              const exhibitionTitle = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
              const title = locale === 'bn' && cat.title_bn ? cat.title_bn : cat.title_en
              const description = locale === 'bn' && cat.description_bn ? cat.description_bn : cat.description_en
              const coverImage = ex.hero_image_url || '/images/catalogs_hero.png'

              return (
                <div key={cat.id} className="group relative bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full hover:-translate-y-1">
                  
                  {/* Image Header */}
                  <Link href={`/catalogs/${cat.id}`} className="aspect-[4/3] relative bg-muted overflow-hidden block shrink-0">
                    <Image
                      src={coverImage}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border backdrop-blur-md bg-black/40 text-white border-white/20 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 text-xs font-medium text-white/90 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {ex.year}
                      </div>
                      <h3 className="text-xl font-bold font-serif line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    </div>
                  </Link>
                  
                  {/* Content Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-sm font-medium text-primary mb-3 line-clamp-1">{exhibitionTitle}</p>
                    
                    {description ? (
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-6 italic opacity-70">
                        No description provided.
                      </p>
                    )}
                    
                    <div className="mt-auto grid grid-cols-2 gap-y-2 text-xs text-muted-foreground mb-6 bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> <span className="uppercase">{cat.language}</span></div>
                      <div className="text-right">v{cat.version}</div>
                      <div>{cat.file_size ? `${(cat.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}</div>
                      <div className="text-right flex items-center justify-end gap-1"><ArrowDownToLine className="w-3 h-3" /> {cat.total_downloads || 0}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/catalogs/${cat.id}`}
                        className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium rounded-lg border bg-background hover:bg-muted transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </Link>
                      <CatalogDownloadButton catalog={cat} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
