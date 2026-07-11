'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/lib/i18n/routing'
import { ImageIcon } from 'lucide-react'
import { SelectContent, SelectItem } from '@/components/ui/select'
import * as SelectPrimitive from '@radix-ui/react-select'

interface Album {
  id: string
  slug?: string
  theme_en: string
  theme_bn: string
  description_en: string | null
  description_bn: string | null
  hero_image_url: string | null
  exhibition_start: string | null
  exhibition_end: string | null
  year: number
  photoCount: number
  videoCount: number
  album_type?: string
  category_slug?: string
}

interface AlbumGridProps {
  albums: Album[]
  locale: string
  searchParams: Record<string, string | undefined>
}

export function AlbumGrid({ albums, locale, searchParams }: AlbumGridProps) {
  const [search, setSearch] = useState(searchParams.search || '')
  const [filterYear, setFilterYear] = useState(searchParams.year || 'all')
  const [sortBy, setSortBy] = useState(searchParams.sort || 'newest')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const uniqueYears = useMemo(() => {
    const years = albums.map(a => a.year).filter(Boolean)
    return Array.from(new Set(years)).sort((a, b) => b - a)
  }, [albums])

  // Featured Collection is dynamically populated from the first 8 albums
  const featuredAlbums = useMemo(() => {
    return albums.slice(0, 8)
  }, [albums])

  const filteredAlbums = useMemo(() => {
    let result = [...albums]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a => 
        (a.theme_en?.toLowerCase().includes(q)) || 
        (a.theme_bn?.toLowerCase().includes(q))
      )
    }

    if (filterYear !== 'all') {
      result = result.filter(a => a.year.toString() === filterYear)
    }

    // Category Tabs Filter logic matching HTML categories
    if (selectedCategory === 'exhibition') {
      result = result.filter(a => a.album_type === 'exhibition')
    } else if (selectedCategory === 'ceremony') {
      result = result.filter(a => a.category_slug === 'opening_ceremony' || a.category_slug === 'award_ceremony')
    } else if (selectedCategory === 'behind_the_scenes') {
      result = result.filter(a => a.category_slug === 'behind_the_scenes')
    } else if (selectedCategory === 'vip') {
      result = result.filter(a => a.category_slug === 'vip' || a.category_slug === 'visitors')
    }

    if (sortBy === 'newest') {
      result = result.sort((a, b) => {
        const dateA = a.exhibition_start ? new Date(a.exhibition_start).getTime() : 0
        const dateB = b.exhibition_start ? new Date(b.exhibition_start).getTime() : 0
        return dateB - dateA
      })
    } else if (sortBy === 'oldest') {
      result = result.sort((a, b) => {
        const dateA = a.exhibition_start ? new Date(a.exhibition_start).getTime() : 0
        const dateB = b.exhibition_start ? new Date(b.exhibition_start).getTime() : 0
        return dateA - dateB
      })
    }

    return result
  }, [albums, search, filterYear, sortBy, selectedCategory])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div style={{ background: 'var(--color-void)' }}>
      {/* ============ TOOLBAR ============ */}
      <section className="toolbar-wrap" style={{ paddingBottom: '56px' }}>
        <div className="toolbar reveal in">
          {/* Search bar */}
          <div className="toolbar-search">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'bn' ? 'থিম, ইভেন্ট বা আর্টওয়ার্ক দ্বারা খুঁজুন...' : 'Search gallery by theme, event, or artwork…'}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                boxShadow: 'none',
                padding: '10px 0',
              }}
            />
          </div>
          
          <div className="toolbar-divider"></div>

          {/* Year Filter */}
          <SelectPrimitive.Root value={filterYear} onValueChange={setFilterYear}>
            <SelectPrimitive.Trigger className="filter-pill border-none focus:ring-0 focus:outline-none cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <SelectPrimitive.Value placeholder="All Years" />
            </SelectPrimitive.Trigger>
            <SelectContent className="bg-[#0B0908] border-white/[0.08] text-[#F4EEDF]">
              <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer">
                {locale === 'bn' ? 'সকল বছর' : 'All Years'}
              </SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year.toString()} className="focus:bg-white/10 focus:text-white cursor-pointer">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectPrimitive.Root>

          {/* Sort Filter */}
          <SelectPrimitive.Root value={sortBy} onValueChange={setSortBy}>
            <SelectPrimitive.Trigger className="filter-pill border-none focus:ring-0 focus:outline-none cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M4 15l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <SelectPrimitive.Value placeholder="Sort By" />
            </SelectPrimitive.Trigger>
            <SelectContent className="bg-[#0B0908] border-white/[0.08] text-[#F4EEDF]">
              <SelectItem value="newest" className="focus:bg-white/10 focus:text-white cursor-pointer">
                {locale === 'bn' ? 'নতুন থেকে পুরনো' : 'Newest First'}
              </SelectItem>
              <SelectItem value="oldest" className="focus:bg-white/10 focus:text-white cursor-pointer">
                {locale === 'bn' ? 'পুরনো থেকে নতুন' : 'Oldest First'}
              </SelectItem>
            </SelectContent>
          </SelectPrimitive.Root>
        </div>
      </section>

      {/* ============ CATEGORIES TAB TABS ============ */}
      <div className="cat-tabs reveal in">
        <button 
          onClick={() => setSelectedCategory('all')} 
          className={`cat-tab ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          {locale === 'bn' ? 'সকল অ্যালবাম' : 'All Albums'}
        </button>
        <button 
          onClick={() => setSelectedCategory('exhibition')} 
          className={`cat-tab ${selectedCategory === 'exhibition' ? 'active' : ''}`}
        >
          {locale === 'bn' ? 'প্রদর্শনী' : 'Exhibitions'}
        </button>
        <button 
          onClick={() => setSelectedCategory('ceremony')} 
          className={`cat-tab ${selectedCategory === 'ceremony' ? 'active' : ''}`}
        >
          {locale === 'bn' ? 'অনুষ্ঠান' : 'Ceremonies'}
        </button>
        <button 
          onClick={() => setSelectedCategory('behind_the_scenes')} 
          className={`cat-tab ${selectedCategory === 'behind_the_scenes' ? 'active' : ''}`}
        >
          {locale === 'bn' ? 'পর্দার অন্তরালে' : 'Behind the Scenes'}
        </button>
        <button 
          onClick={() => setSelectedCategory('vip')} 
          className={`cat-tab ${selectedCategory === 'vip' ? 'active' : ''}`}
        >
          {locale === 'bn' ? 'ভিআইপি ও অতিথি' : 'VIP & Guests'}
        </button>
      </div>

      {/* ============ FEATURED COLLECTION (masonry) ============ */}
      <section className="artists" style={{ paddingTop: 0, paddingBottom: '80px', background: 'var(--color-void)' }}>
        <div className="section-head reveal in">
          <h2>{locale === 'bn' ? 'ফিচার্ড কালেকশন' : 'Featured Collection'}</h2>
          <p>
            {locale === 'bn' 
              ? 'আর্কাইভ থেকে সম্পাদকের পছন্দ — মুহূর্তগুলো যা রঙধনুর চেতনাকে সর্বোত্তমভাবে ফুটিয়ে তোলে।' 
              : "Editor's picks from across the archive — the moments that best capture Rongdhonu's spirit."}
          </p>
        </div>
        
        <div className="masonry">
          {featuredAlbums.map((album, index) => {
            const title = locale === 'bn' ? album.theme_bn : album.theme_en
            const dateDisplay = formatDate(album.exhibition_start)
            
            // Sequence of aspect ratios to match dynamic grid alignment of gallery.html
            const ratioStyles = ['3/4', '4/3', '1/1', '4/5', '3/4', '4/3', '3/4', '4/3']
            const styleRatio = ratioStyles[index % ratioStyles.length]

            let categoryTag = locale === 'bn' ? 'আর্কাইভ' : 'Archive'
            if (album.album_type === 'exhibition') {
              categoryTag = locale === 'bn' ? 'প্রদর্শনী' : 'Exhibition'
            } else if (album.category_slug) {
              if (album.category_slug === 'opening_ceremony' || album.category_slug === 'award_ceremony') {
                categoryTag = locale === 'bn' ? 'অনুষ্ঠান' : 'Ceremony'
              } else if (album.category_slug === 'behind_the_scenes') {
                categoryTag = locale === 'bn' ? 'পর্দার আড়ালে' : 'Behind the Scenes'
              } else if (album.category_slug === 'vip') {
                categoryTag = locale === 'bn' ? 'ভিআইপি অতিথি' : 'VIP Guests'
              }
            }

            return (
              <Link 
                key={`featured-${album.id}`}
                href={`/gallery/${album.slug || album.id}`} 
                className="masonry-tile artwork reveal in group block"
                style={{ aspectRatio: styleRatio }}
              >
                {album.hero_image_url ? (
                  <img 
                    src={album.hero_image_url} 
                    alt={title} 
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1E1A16]">
                    <ImageIcon className="w-12 h-12 text-[#5C5347]/20" />
                  </div>
                )}
                <div className="scrim"></div>
                <div className="frame-edge"></div>
                <div className="masonry-expand">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path d="M8 3H3v5M17 8V3h-5M3 12v5h5M12 17h5v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="wall-label">
                  <span className="no">{categoryTag}</span>
                  <b>{title}</b>
                  <span>{dateDisplay || album.year}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============ ALL ALBUMS ============ */}
      <section className="collection" style={{ paddingBottom: '120px' }}>
        <div className="section-head reveal in">
          <h2>{locale === 'bn' ? 'সকল অ্যালবাম' : 'All Albums'}</h2>
          <p>
            {locale === 'bn' 
              ? 'প্রতিটি সংগ্রহ, সম্পূর্ণরূপে অন্বেষণ করার জন্য প্রস্তুত।' 
              : 'Every collection, organized and ready to explore in full.'}
          </p>
        </div>
        
        {filteredAlbums.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 rounded-none border border-white/10 flex items-center justify-center mb-6 mx-auto bg-white/5">
              <ImageIcon className="w-10 h-10 text-[#F4EEDF]/20" />
            </div>
            <h3 className="font-serif text-2xl text-[#F4EEDF] mb-2 font-bold">
              {locale === 'bn' ? 'কোনো অ্যালবাম পাওয়া যায়নি' : 'No albums found'}
            </h3>
          </div>
        ) : (
          <div className="album-grid">
            {filteredAlbums.map((album) => {
              const title = locale === 'bn' ? album.theme_bn : album.theme_en
              const description = locale === 'bn' ? album.description_bn : album.description_en
              const dateDisplay = formatDate(album.exhibition_start)
              const totalMedia = album.photoCount + album.videoCount

              return (
                <div key={`album-${album.id}`} className="album-card reveal in">
                  <div className="album-media artwork">
                    {album.hero_image_url ? (
                      <img 
                        src={album.hero_image_url} 
                        alt={title} 
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#1E1A16]">
                        <ImageIcon className="w-12 h-12 text-[#5C5347]/20" />
                      </div>
                    )}
                    <div className="scrim"></div>
                    <div className="frame-edge"></div>
                    <span className="album-count">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="8" cy="9" r="1.4" fill="currentColor"/>
                        <path d="M4 15l4-4 3 3 5-6 2 3" stroke="currentColor" strokeWidth="1.4"/>
                      </svg> 
                      {' '}{totalMedia}
                    </span>
                    <span className="album-date">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" stroke-width="1.5"/>
                      </svg> 
                      {' '}{dateDisplay || album.year}
                    </span>
                  </div>
                  
                  <div className="album-body">
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                    <Link href={`/gallery/${album.slug || album.id}`} className="album-link">
                      {locale === 'bn' ? 'গ্যালারি দেখুন' : 'View Gallery'}{' '}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
