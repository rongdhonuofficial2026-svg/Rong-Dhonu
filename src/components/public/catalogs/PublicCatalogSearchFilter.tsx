'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SelectContent, SelectItem } from '@/components/ui/select'
import * as SelectPrimitive from '@radix-ui/react-select'

export function PublicCatalogSearchFilter({ years }: { years: number[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
          params.set('q', query)
        } else {
          params.delete('q')
        }
        router.push(`?${params.toString()}`, { scroll: false })
      })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, router, searchParams])

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <section className="toolbar-wrap">
      <div className="toolbar reveal in">
        {/* Search bar */}
        <div className="toolbar-search">
          <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalogs by title or exhibition name…"
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

        {/* Filter row */}
        {/* Year */}
        <SelectPrimitive.Root 
          value={searchParams.get('year') || 'all'} 
          onValueChange={v => handleFilterChange('year', v)}
        >
          <SelectPrimitive.Trigger className="filter-pill border-none focus:ring-0 focus:outline-none cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <SelectPrimitive.Value placeholder="All Years" />
          </SelectPrimitive.Trigger>
          <SelectContent className="bg-[#0B0908] border-white/[0.08] text-[#F4EEDF]">
            <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer">All Years</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()} className="focus:bg-white/10 focus:text-white cursor-pointer">{y}</SelectItem>
            ))}
          </SelectContent>
        </SelectPrimitive.Root>

        {/* Language */}
        <SelectPrimitive.Root 
          value={searchParams.get('language') || 'all'} 
          onValueChange={v => handleFilterChange('language', v)}
        >
          <SelectPrimitive.Trigger className="filter-pill border-none focus:ring-0 focus:outline-none cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2.5 10h15M10 2.5c2.2 2.2 2.2 12.8 0 15M10 2.5c-2.2 2.2-2.2 12.8 0 15" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <SelectPrimitive.Value placeholder="All Languages" />
          </SelectPrimitive.Trigger>
          <SelectContent className="bg-[#0B0908] border-white/[0.08] text-[#F4EEDF]">
            <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer">All Languages</SelectItem>
            <SelectItem value="bilingual" className="focus:bg-white/10 focus:text-white cursor-pointer">Bilingual</SelectItem>
            <SelectItem value="en" className="focus:bg-white/10 focus:text-white cursor-pointer">English</SelectItem>
            <SelectItem value="bn" className="focus:bg-white/10 focus:text-white cursor-pointer">Bengali</SelectItem>
          </SelectContent>
        </SelectPrimitive.Root>

        {/* Category */}
        <SelectPrimitive.Root 
          value={searchParams.get('category') || 'all'} 
          onValueChange={v => handleFilterChange('category', v)}
        >
          <SelectPrimitive.Trigger className="filter-pill border-none focus:ring-0 focus:outline-none cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M3 10l6-6h6v6l-6 6-6-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="12.5" cy="7.5" r="1" fill="currentColor" />
            </svg>
            <SelectPrimitive.Value placeholder="All Categories" />
          </SelectPrimitive.Trigger>
          <SelectContent className="bg-[#0B0908] border-white/[0.08] text-[#F4EEDF]">
            <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer">All Categories</SelectItem>
            <SelectItem value="exhibition" className="focus:bg-white/10 focus:text-white cursor-pointer">Exhibition</SelectItem>
            <SelectItem value="retrospective" className="focus:bg-white/10 focus:text-white cursor-pointer">Retrospective</SelectItem>
            <SelectItem value="solo" className="focus:bg-white/10 focus:text-white cursor-pointer">Solo Exhibition</SelectItem>
            <SelectItem value="group" className="focus:bg-white/10 focus:text-white cursor-pointer">Group Exhibition</SelectItem>
            <SelectItem value="other" className="focus:bg-white/10 focus:text-white cursor-pointer">Other</SelectItem>
          </SelectContent>
        </SelectPrimitive.Root>

        {/* Sort */}
        <SelectPrimitive.Root 
          value={searchParams.get('sort') || 'newest'} 
          onValueChange={v => handleFilterChange('sort', v)}
        >
          <SelectPrimitive.Trigger className="filter-pill border-none focus:ring-0 focus:outline-none cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 15l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <SelectPrimitive.Value placeholder="Sort By" />
          </SelectPrimitive.Trigger>
          <SelectContent className="bg-[#0B0908] border-white/[0.08] text-[#F4EEDF]">
            <SelectItem value="newest" className="focus:bg-white/10 focus:text-white cursor-pointer">Newest First</SelectItem>
            <SelectItem value="oldest" className="focus:bg-white/10 focus:text-white cursor-pointer">Oldest First</SelectItem>
            <SelectItem value="downloads" className="focus:bg-white/10 focus:text-white cursor-pointer">Most Downloaded</SelectItem>
          </SelectContent>
        </SelectPrimitive.Root>
      </div>
    </section>
  )
}
