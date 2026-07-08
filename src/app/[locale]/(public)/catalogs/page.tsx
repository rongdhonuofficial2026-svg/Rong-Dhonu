import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { getCmsContent } from "@/lib/cms/content"
import { BookOpen, Calendar, Globe, ArrowDownToLine, Eye, FileText, Search } from 'lucide-react'
import { CatalogDownloadButton } from '@/components/public/catalogs/CatalogDownloadButton'
import { PublicCatalogSearchFilter } from '@/components/public/catalogs/PublicCatalogSearchFilter'
import { Metadata } from 'next'
import { batchSyncExhibitions } from '@/lib/exhibition-lifecycle'

import { generateDynamicMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Navigation' })
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhono'
  const faviconUrl = settingsData?.favicon_url

  return generateDynamicMetadata({
    title: t('catalogs'),
    description: 'Browse every official exhibition catalog. Discover each exhibition through beautifully curated digital publications that preserve our artistic journey.',
    url: '/catalogs',
    imageUrl: '/images/catalogs_hero.png',
    locale,
    siteName,
    faviconUrl,
  })
}

export default async function PublicCatalogsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; year?: string; sort?: string; language?: string; category?: string }>
}) {
  const { locale } = await params
  const { q, year, sort, language, category } = await searchParams
  const supabase = await createClient()

  // Pre-sync all exhibition lifecycles before querying
  await batchSyncExhibitions(supabase).catch(err => console.error('[Public Catalogs] batchSync failed:', err))

  // Build the query — CRITICAL: Show catalogs from ONGOING or ARCHIVED exhibitions in the global archive
  // Published catalogs for draft/upcoming exhibitions are hidden.
  let query = supabase
    .from('catalogs')
    .select('*, exhibitions!inner(id, theme_en, theme_bn, year, hero_image_url, status)')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .in('exhibitions.status', ['ongoing', 'archived'])

  if (q) {
    query = query.or(`title_en.ilike.%${q}%,title_bn.ilike.%${q}%`)
  }
  if (language && language !== 'all') {
    query = query.eq('language', language)
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // Sorting
  if (sort === 'oldest') {
    query = query.order('published_at', { ascending: true })
  } else if (sort === 'downloads') {
    query = query.order('total_downloads', { ascending: false })
  } else {
    // Default: newest first
    query = query.order('published_at', { ascending: false })
  }

  const { data: catalogs, error } = await query

  // Get all unique years for the year filter dropdown (from ALL ongoing/archived exhibition catalogs)
  const { data: allArchivedCatalogs } = await supabase
    .from('catalogs')
    .select('exhibitions!inner(year, status)')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .in('exhibitions.status', ['ongoing', 'archived'])

  const uniqueYears = Array.from(
    new Set(allArchivedCatalogs?.map(c => (c.exhibitions as any).year).filter(Boolean) as number[])
  ).sort((a, b) => b - a)

  // Then apply year filter client-side (for dropdown population without extra query)
  const filteredCatalogs = catalogs?.filter(cat => {
    if (!year || year === 'all') return true
    return (cat.exhibitions as any).year.toString() === year
  }) || []

  const isSearchEmpty = filteredCatalogs.length === 0 && (q || language || category || (year && year !== 'all'))
  const isTotallyEmpty = filteredCatalogs.length === 0 && !q && !language && !category && (!year || year === 'all')

  // Fetch CMS hero configurations
  const heroData = await getCmsContent('catalogs', 'hero', locale);

  const heroTitle = heroData?.title || 'Exhibition Catalog Archive';
  const heroSubtitle = heroData?.subtitle || 'Browse every official Rongdhono exhibition catalog. Discover each exhibition through beautifully curated digital publications that preserve our artistic journey.';
  const heroImage = heroData?.imageUrl || '/images/catalogs_hero.png';

  return (
    <div className="min-h-screen bg-[#EFE6D2] pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImage} 
            alt={heroTitle} 
            fill 
            className="object-cover object-center opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#EFE6D2] via-[#EFE6D2]/80 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#DCCFAE] bg-[#F4EEDF] text-[#B4233A] mb-6 shadow-sm">
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Digital Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-[#1E1A16] mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-[#5C5347] max-w-3xl mx-auto font-light leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Search & Filters */}
        {!isTotallyEmpty && (
          <PublicCatalogSearchFilter years={uniqueYears} />
        )}

        {/* Empty States */}
        {isTotallyEmpty ? (
          <div className="text-center py-32 bg-[#F4EEDF] rounded-none border border-dashed border-[#DCCFAE] flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-none bg-[#EFE6D2] border border-[#DCCFAE] flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-[#5C5347]/40" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1E1A16] mb-3">The Archive is Empty</h2>
            <p className="text-[#5C5347] max-w-md mx-auto text-lg leading-relaxed">
              No official exhibition catalogs have been published yet. Please check back after our upcoming exhibitions to explore our digital publications.
            </p>
          </div>
        ) : isSearchEmpty ? (
          <div className="text-center py-24 bg-[#F4EEDF] rounded-none border border-dashed border-[#DCCFAE] flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-none bg-[#EFE6D2] border border-[#DCCFAE] flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-[#5C5347]/40" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1E1A16] mb-3">No Results Found</h2>
            <p className="text-[#5C5347] leading-relaxed">
              We couldn't find any catalogs matching your current search criteria. Try adjusting your filters or search terms.
            </p>
            <Link href="/catalogs" className="mt-6 text-[#B4233A] hover:underline font-bold uppercase tracking-wider text-xs">
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
              // Prefer catalog cover image, fall back to exhibition hero
              const coverImage = cat.cover_image_url || ex.hero_image_url || '/images/catalogs_hero.png'

              return (
                <div key={cat.id} className="group relative bg-[#F4EEDF] border border-[#DCCFAE] rounded-none hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full hover:-translate-y-1"
                  style={{ boxShadow: '0 10px 40px -10px rgba(30,26,22,0.06)' }}
                >
                  {/* Crimson top edge on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#B4233A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />
                  
                  {/* Image Header */}
                  <Link href={`/catalogs/${cat.id}`} className="aspect-[4/3] relative bg-[#DCCFAE]/20 overflow-hidden block shrink-0 border-b border-[#DCCFAE]">
                    <Image
                      src={coverImage}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151210]/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-black/50 text-white border border-white/20 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#F4C662] mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {ex.year}
                      </div>
                      <h3 className="text-xl font-bold font-serif line-clamp-1 group-hover:text-[#F4C662] transition-colors leading-tight">{title}</h3>
                    </div>
                  </Link>
                  
                  {/* Content Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-[10px] font-bold text-[#B4233A] uppercase tracking-widest mb-3 line-clamp-1">{exhibitionTitle}</p>
                    
                    {description ? (
                      <p className="text-sm text-[#5C5347] mb-6 line-clamp-2 leading-relaxed flex-grow">
                        {description}
                      </p>
                    ) : (
                      <p className="text-sm text-[#5C5347]/50 mb-6 italic flex-grow">
                        No description provided.
                      </p>
                    )}
                    
                    <div className="mt-auto grid grid-cols-2 gap-y-2 text-[11px] font-medium text-[#5C5347] mb-6 bg-[#EFE6D2] p-3 border border-[#DCCFAE]/60">
                      <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-[#B4233A]" /> <span className="uppercase font-bold">{cat.language}</span></div>
                      <div className="text-right font-mono">v{cat.version}</div>
                      <div>{cat.file_size ? `${(cat.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}</div>
                      <div className="text-right flex items-center justify-end gap-1"><ArrowDownToLine className="w-3 h-3 text-[#B4233A]" /> {cat.total_downloads || 0}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/catalogs/${cat.id}`}
                        className="flex-1 flex items-center justify-center gap-2 h-10 text-xs font-bold uppercase tracking-widest rounded-full border border-[#DCCFAE] bg-transparent hover:bg-[#EFE6D2] text-[#1E1A16] transition-colors active:scale-[0.97]"
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
