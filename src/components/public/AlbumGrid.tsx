'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Link, useRouter, usePathname } from '@/lib/i18n/routing'
import { Image as ImageIcon, Video, Calendar, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LuxuryCard } from '@/components/admin/ui/LuxuryCard'

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
}

interface AlbumGridProps {
  albums: Album[]
  locale: string
  searchParams: Record<string, string | undefined>
}

export function AlbumGrid({ albums, locale, searchParams }: AlbumGridProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useState(searchParams.search || '')
  const [filterYear, setFilterYear] = useState(searchParams.year || 'all')
  const [sortBy, setSortBy] = useState(searchParams.sort || 'newest')

  const uniqueYears = useMemo(() => {
    const years = albums.map(a => a.year).filter(Boolean)
    return Array.from(new Set(years)).sort((a, b) => b - a)
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
  }, [albums, search, filterYear, sortBy])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-12">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-foreground/10">
        <div className="w-full md:w-1/3">
          <Input
            placeholder={locale === 'bn' ? 'অ্যালবাম খুঁজুন...' : 'Search albums...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/50 border-foreground/10 focus-visible:ring-accent"
          />
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white/50 border-foreground/10">
              <SelectValue placeholder={locale === 'bn' ? 'বছর' : 'Year'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === 'bn' ? 'সকল বছর' : 'All Years'}</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white/50 border-foreground/10">
              <SelectValue placeholder={locale === 'bn' ? 'সাজান' : 'Sort by'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{locale === 'bn' ? 'নতুন থেকে পুরনো' : 'Newest First'}</SelectItem>
              <SelectItem value="oldest">{locale === 'bn' ? 'পুরনো থেকে নতুন' : 'Oldest First'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filteredAlbums.length === 0 ? (
        <div className="py-32 text-center">
          <div className="w-20 h-20 rounded-full border border-foreground/10 flex items-center justify-center mb-6 mx-auto bg-white">
            <ImageIcon className="w-10 h-10 text-foreground/30" />
          </div>
          <h3 className="font-serif text-2xl text-foreground mb-2">
            {locale === 'bn' ? 'কোনো অ্যালবাম পাওয়া যায়নি' : 'No albums found'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlbums.map(album => {
            const title = locale === 'bn' ? album.theme_bn : album.theme_en
            const description = locale === 'bn' ? album.description_bn : album.description_en
            const dateDisplay = formatDate(album.exhibition_start)
            const totalMedia = album.photoCount + album.videoCount

            return (
              <Link key={album.id} href={`/gallery/${album.slug || album.id}`} className="group block">
                <LuxuryCard padding="none" className="overflow-hidden h-full flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden">
                    {album.hero_image_url ? (
                      <Image 
                        src={album.hero_image_url} 
                        alt={title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      {album.photoCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 text-xs font-medium border border-white/10">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{album.photoCount}</span>
                        </div>
                      )}
                      {album.videoCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 text-xs font-medium border border-white/10">
                          <Video className="w-3.5 h-3.5" />
                          <span>{album.videoCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-3 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      {dateDisplay || album.year}
                    </div>
                    
                    <h3 className="font-serif text-2xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    
                    {description && (
                      <p className="text-muted-foreground line-clamp-2 text-sm mb-6 flex-1">
                        {description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-foreground/5 flex items-center justify-between text-sm font-medium text-foreground">
                      <span>{locale === 'bn' ? 'গ্যালারি দেখুন' : 'View Gallery'}</span>
                      <ArrowRight className="w-4 h-4 text-accent transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </LuxuryCard>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
