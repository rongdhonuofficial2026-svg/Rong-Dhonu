import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/routing'
import { getCmsContent } from "@/lib/cms/content"
import { CatalogDownloadButton } from '@/components/public/catalogs/CatalogDownloadButton'
import { PublicCatalogSearchFilter } from '@/components/public/catalogs/PublicCatalogSearchFilter'
import { Metadata } from 'next'
import { batchSyncExhibitions } from '@/lib/exhibition-lifecycle'
import { generateDynamicMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const { getCmsContent } = await import('@/lib/cms/content')
  
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhonu'
  const faviconUrl = settingsData?.favicon_url
  
  const seoData = await getCmsContent('catalogs', 'seo', locale)
  const seoTitle = seoData?.seo_title || siteName
  const seoDescription = seoData?.meta_description || settingsData?.site_description || ''
  const ogImage = seoData?.og_image || settingsData?.default_og_image || 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200'

  return generateDynamicMetadata({
    title: seoTitle,
    description: seoDescription,
    url: '/catalogs',
    imageUrl: ogImage,
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

  const heroData = await getCmsContent('catalogs', 'hero', locale)

  // Build the query
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
    query = query.order('published_at', { ascending: false })
  }

  const { data: catalogs } = await query

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

  // Apply year filter client-side
  const filteredCatalogs = catalogs?.filter(cat => {
    if (!year || year === 'all') return true
    return (cat.exhibitions as any).year.toString() === year
  }) || []

  const isSearchEmpty = filteredCatalogs.length === 0 && (q || language || category || (year && year !== 'all'))
  const isTotallyEmpty = filteredCatalogs.length === 0 && !q && !language && !category && (!year || year === 'all')

  // Calculate dynamic stats
  const totalPublications = filteredCatalogs.length
  const totalSizeBytes = filteredCatalogs.reduce((acc, curr) => acc + (curr.file_size || 0), 0) || 0
  const totalSizeMB = totalSizeBytes > 0 ? (totalSizeBytes / 1024 / 1024).toFixed(1) : "3.7"

  // Slice featured catalog (newest) and the remaining list
  const featuredCatalog = filteredCatalogs[0]
  const otherCatalogs = filteredCatalogs.slice(1)

  return (
    <div className="catalogs-page-wrapper">
      {/* ============ PAGE HERO ============ */}
      <header className="page-hero catalogs-page-hero artwork">
        <img 
          src={heroData?.imageUrl || "/images/hero-bg-catalogs.png"} 
          alt="Rows of archived books and publications" 
          loading="eager"
        />
        <div className="scrim"></div>
        <div className="frame-edge"></div>
        <div className="page-hero-inner">
          <div className="reveal in">
            <div className="eyebrow center">{locale === 'bn' ? 'প্রকাশনা' : 'Publications'}</div>
            <h1 dangerouslySetInnerHTML={{ __html: heroData?.title || (locale === 'bn' ? 'প্রদর্শনী <em>ক্যাটালগ আর্কাইভ</em>' : 'Exhibition <em>Catalog Archive</em>') }} />
            <p className="page-hero-sub">
              {heroData?.subtitle || (locale === 'bn' 
                ? 'রংধনুর প্রতিটি অফিসিয়াল প্রদর্শনী ক্যাটালগ ব্রাউজ করুন। সুন্দরভাবে কিউরেট করা ডিজিটাল প্রকাশনাগুলোর মাধ্যমে প্রতিটি প্রদর্শনী অন্বেষণ করুন।'
                : 'Browse every official Rongdhonu exhibition catalog. Discover each exhibition through beautifully curated digital publications that preserve our artistic journey.')}
            </p>
          </div>
          <div className="page-hero-meta reveal in">
            <div><b>{totalPublications}</b><span>{locale === 'bn' ? 'প্রকাশনা' : 'Publications'}</span></div>
            <div><b>{totalSizeMB} MB</b><span>{locale === 'bn' ? 'আর্কাইভ সাইজ' : 'Archive Size'}</span></div>
            <div><b>{locale === 'bn' ? 'ইংরেজি' : 'EN'}</b><span>{locale === 'bn' ? 'ভাষা' : 'Language'}</span></div>
          </div>
        </div>
      </header>

      {/* ============ TOOLBAR ============ */}
      {!isTotallyEmpty && (
        <PublicCatalogSearchFilter years={uniqueYears} />
      )}

      {/* Empty States */}
      {isTotallyEmpty ? (
        <section className="collection" style={{ paddingTop: 0, paddingBottom: '140px' }}>
          <div className="text-center py-32 bg-[#151210] rounded-none border border-dashed border-white/10 flex flex-col items-center justify-center max-w-3xl mx-auto p-8">
            <div className="w-20 h-20 rounded-none bg-[#1E1A16] border border-white/10 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-bright)" strokeWidth="1.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10M6 10h10M6 14h10" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#F4EEDF] mb-3">{locale === 'bn' ? 'আর্কাইভ খালি' : 'The Archive is Empty'}</h2>
            <p className="text-[#F4EEDF]/70 max-w-md mx-auto text-lg leading-relaxed">
              {locale === 'bn'
                ? 'কোনো অফিসিয়াল প্রদর্শনী ক্যাটালগ এখনও প্রকাশিত হয়নি। অনুগ্রহ করে আমাদের আসন্ন প্রদর্শনীগুলোর পর আবার খোঁজ নিন।'
                : 'No official exhibition catalogs have been published yet. Please check back after our upcoming exhibitions to explore our digital publications.'}
            </p>
          </div>
        </section>
      ) : isSearchEmpty ? (
        <section className="collection" style={{ paddingTop: 0, paddingBottom: '140px' }}>
          <div className="text-center py-24 bg-[#151210] rounded-none border border-dashed border-white/10 flex flex-col items-center justify-center max-w-2xl mx-auto p-8">
            <div className="w-20 h-20 rounded-none bg-[#1E1A16] border border-white/10 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-bright)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F4EEDF] mb-3">{locale === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No Results Found'}</h2>
            <p className="text-[#F4EEDF]/70 leading-relaxed mb-6">
              {locale === 'bn'
                ? 'আপনার অনুসন্ধান মানদণ্ডের সাথে মিলে এমন কোনো ক্যাটালগ আমরা খুঁজে পাইনি। অনুগ্রহ করে ফিল্টার পরিবর্তন করে দেখুন।'
                : "We couldn't find any catalogs matching your current search criteria. Try adjusting your filters or search terms."}
            </p>
            <Link href="/catalogs" className="btn btn-gold btn-sm magnetic">
              {locale === 'bn' ? 'সব ফিল্টার সাফ করুন' : 'Clear all filters'}
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* ============ FEATURED PUBLICATION ============ */}
          {featuredCatalog && (
            <section className="artists" style={{ paddingTop: 0 }}>
              <div className="featured-catalog reveal in">
                <div className="featured-catalog-media artwork">
                  <img 
                    src={featuredCatalog.cover_image_url || '/images/catalogs/featured.png'} 
                    alt={locale === 'bn' && featuredCatalog.title_bn ? featuredCatalog.title_bn : featuredCatalog.title_en}
                    loading="lazy"
                  />
                  <div className="scrim"></div>
                  <div className="frame-edge"></div>
                  <div className="catalog-format" style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                      <rect x="4" y="2" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3"/>
                    </svg> 
                    <span>PDF</span>
                  </div>
                </div>
                <div>
                  <div className="eyebrow">{locale === 'bn' ? 'বিশেষ প্রকাশনা' : 'Featured Publication'}</div>
                  <h2>
                    {locale === 'bn' && (featuredCatalog.exhibitions as any).theme_bn ? (featuredCatalog.exhibitions as any).theme_bn : (featuredCatalog.exhibitions as any).theme_en} 
                    {' '}<em style={{ fontStyle: 'italic', color: 'var(--color-gold-bright)', fontWeight: 400 }}>{locale === 'bn' ? 'ক্যাটালগ' : 'Catalog'}</em>
                  </h2>
                  <p>
                    {locale === 'bn' && featuredCatalog.description_bn ? featuredCatalog.description_bn : featuredCatalog.description_en}
                  </p>
                  <div className="catalog-meta" style={{ maxWidth: '420px' }}>
                    <div>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M2.5 10h15M10 2.5c2.2 2.2 2.2 12.8 0 15M10 2.5c-2.2 2.2-2.2 12.8 0 15" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      <span>{featuredCatalog.language ? featuredCatalog.language.toUpperCase() : 'EN'}</span>
                    </div>
                    <div>v{featuredCatalog.version}</div>
                    <div>{featuredCatalog.file_size ? `${(featuredCatalog.file_size / 1024 / 1024).toFixed(1)} MB` : '3.7 MB'}</div>
                    <div>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <path d="M10 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 15v1.5A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg> 
                      <span>{featuredCatalog.total_downloads || 0}</span>
                    </div>
                  </div>
                  <div className="hero-ctas">
                    <CatalogDownloadButton 
                      catalog={featuredCatalog} 
                      className="btn btn-gold magnetic"
                      label={locale === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}
                      isFeatured={true}
                    />
                    <Link href={`/catalogs/${featuredCatalog.id}`} className="btn btn-line magnetic">
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>{locale === 'bn' ? 'প্রাকদর্শন' : 'Preview'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============ ABOUT THE ARCHIVE ============ */}
          <section className="about" id="archive-story">
            <div className="about-grid">
              <div className="about-copy reveal in">
                <div className="eyebrow on-paper">{locale === 'bn' ? 'প্রতিটি প্রদর্শনী সংরক্ষণ' : 'Preserving Every Exhibition'}</div>
                <h2>{locale === 'bn' ? 'আমাদের প্রদর্শিত প্রতিটি শিল্পকর্মের একটি' : 'A permanent, printable record of'} <b>{locale === 'bn' ? 'স্থায়ী, মুদ্রণযোগ্য রেকর্ড।' : 'everything we show.'}</b></h2>
                <p className="mission-body">
                  {locale === 'bn' 
                    ? 'প্রতিটি ক্যাটালগ কেবল কাজের তালিকার চেয়েও বেশি কিছু — এটি একটি কিউরেটরিয়াল প্রবন্ধ, একটি আলোকচিত্র প্লেট এবং সেই মৌসুমের আকার দানকারী শিল্পীদের একটি রেকর্ড। যেমনটি আমাদের কালেকটিভ বাড়ছে, এই আর্কাইভ সমসাময়িক বাঙালি শিল্পের একটি জীবন্ত ইতিহাস হয়ে উঠেছে।'
                    : "Each catalog is more than a checklist of works — it's a curatorial essay, a photographic plate, and a record of the artists who shaped that season. As the collective grows, this archive becomes a living history of contemporary Bengali art."}
                </p>
              </div>
              <div className="about-visual reveal in">
                <div className="about-img-main artwork">
                  <img 
                    src="/images/placeholders/hero.webp" 
                    alt="Stack of printed exhibition catalogues" 
                    loading="lazy"
                  />
                  <div className="scrim soft"></div>
                  <div className="frame-edge"></div>
                </div>
              </div>
            </div>
          </section>

          {/* ============ CATALOG ARCHIVE GRID ============ */}
          <section className="collection" style={{ paddingTop: 0 }}>
            <div className="section-head reveal in">
              <h2>{locale === 'bn' ? 'সম্পূর্ণ আর্কাইভ' : 'Full Archive'}</h2>
              <p>{locale === 'bn' ? 'বছর, ভাষা এবং বিভাগ অনুসারে আমাদের প্রকাশিত প্রতিটি ক্যাটালগ ব্রাউজ করুন।' : 'Every catalog we have published, browsable by year, language, and category.'}</p>
            </div>
            <div className="catalog-grid">
              {filteredCatalogs.map((cat) => {
                const ex = cat.exhibitions as any
                const exhibitionTitle = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
                const title = locale === 'bn' && cat.title_bn ? cat.title_bn : cat.title_en
                
                return (
                  <div key={cat.id} className="catalog-card reveal in">
                    <div className="catalog-cover artwork">
                      <img 
                        src={cat.cover_image_url || ex.hero_image_url || '/images/catalogs/featured.png'} 
                        alt={title}
                        loading="lazy"
                      />
                      <div className="scrim"></div>
                      <div className="frame-edge"></div>
                      <div className="catalog-format">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                          <rect x="4" y="2" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                          <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3"/>
                        </svg> 
                        <span>PDF</span>
                      </div>
                      <span className="catalog-year">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                          <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg> 
                        <span>{ex.year}</span>
                      </span>
                      <div className="catalog-title-ov">{title}</div>
                    </div>
                    <div className="catalog-body">
                      <div className="catalog-cat">{exhibitionTitle}</div>
                      <div className="catalog-id">ID · {cat.id.substring(0, 8)}</div>
                      <div className="catalog-meta">
                        <div>
                          <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4"/>
                            <path d="M2.5 10h15M10 2.5c2.2 2.2 2.2 12.8 0 15M10 2.5c-2.2 2.2-2.2 12.8 0 15" stroke="currentColor" strokeWidth="1.2"/>
                          </svg> 
                          <span>{cat.language ? cat.language.toUpperCase() : 'EN'}</span>
                        </div>
                        <div>v{cat.version}</div>
                        <div>{cat.file_size ? `${(cat.file_size / 1024 / 1024).toFixed(1)} MB` : '3.7 MB'}</div>
                        <div>
                          <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                            <path d="M10 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 15v1.5A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg> 
                          <span>{cat.total_downloads || 0}</span>
                        </div>
                      </div>
                      <div className="catalog-actions">
                        <Link href={`/catalogs/${cat.id}`} className="btn btn-line">
                          <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                            <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          <span>{locale === 'bn' ? 'প্রাকদর্শন' : 'Preview'}</span>
                        </Link>
                        <CatalogDownloadButton 
                          catalog={cat} 
                          className="btn btn-gold"
                          label={locale === 'bn' ? 'ডাউনলোড' : 'Download'}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Coming soon placeholder card */}
              <div className="catalog-card reveal in" style={{ opacity: 0.72 }}>
                <div className="catalog-cover artwork">
                  <img 
                    src="/images/catalogs/coming_soon.jpg" 
                    alt="Next Season's Catalog"
                    loading="lazy"
                  />
                  <div className="scrim"></div>
                  <div className="frame-edge"></div>
                  <div className="catalog-title-ov">{locale === 'bn' ? 'পরবর্তী মৌসুমের ক্যাটালগ' : "Next Season's Catalog"}</div>
                </div>
                <div className="catalog-body">
                  <div className="catalog-cat">{locale === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}</div>
                  <p style={{ fontSize: '13.5px', color: 'var(--color-parchment-faint)', lineHeight: 1.6, margin: '6px 0 20px' }}>
                    {locale === 'bn' 
                      ? 'প্রতিটি প্রদর্শনীর পরে একটি নতুন প্রকাশনা আমাদের আর্কাইভে যুক্ত করা হয়। আমাদের পরবর্তী প্রদর্শনীর পর আবার পরীক্ষা করুন।'
                      : 'A new publication is added to the archive after every exhibition. Check back after our next opening.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
