'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, ArrowUpDown, Globe, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    <div className="flex flex-col gap-3 mb-12">
      {/* Search bar */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPending ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search catalogs by title or exhibition name..." 
          className="pl-11 h-12 bg-card border-border focus-visible:ring-primary rounded-xl text-foreground shadow-sm"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        {/* Year */}
        <Select 
          value={searchParams.get('year') || 'all'} 
          onValueChange={v => handleFilterChange('year', v)}
        >
          <SelectTrigger className="w-auto min-w-[130px] h-10 rounded-xl bg-card border-border shadow-sm text-sm">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Language */}
        <Select 
          value={searchParams.get('language') || 'all'} 
          onValueChange={v => handleFilterChange('language', v)}
        >
          <SelectTrigger className="w-auto min-w-[140px] h-10 rounded-xl bg-card border-border shadow-sm text-sm">
            <Globe className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="bilingual">Bilingual</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="bn">Bengali</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select 
          value={searchParams.get('category') || 'all'} 
          onValueChange={v => handleFilterChange('category', v)}
        >
          <SelectTrigger className="w-auto min-w-[150px] h-10 rounded-xl bg-card border-border shadow-sm text-sm">
            <Tag className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="exhibition">Exhibition</SelectItem>
            <SelectItem value="retrospective">Retrospective</SelectItem>
            <SelectItem value="solo">Solo Exhibition</SelectItem>
            <SelectItem value="group">Group Exhibition</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select 
          value={searchParams.get('sort') || 'newest'} 
          onValueChange={v => handleFilterChange('sort', v)}
        >
          <SelectTrigger className="w-auto min-w-[165px] h-10 rounded-xl bg-card border-border shadow-sm text-sm">
            <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="downloads">Most Downloaded</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
