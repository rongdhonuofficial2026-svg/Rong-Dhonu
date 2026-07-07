'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
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

  const handleYearChange = (year: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (year && year !== 'all') {
        params.set('year', year)
      } else {
        params.delete('year')
      }
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const handleSortChange = (sort: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (sort && sort !== 'newest') {
        params.set('sort', sort)
      } else {
        params.delete('sort')
      }
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12 bg-card p-4 rounded-2xl border shadow-sm">
      <div className="relative flex-1">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPending ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search catalogs by title or exhibition name..." 
          className="pl-11 h-12 bg-background/50 border-input focus-visible:ring-accent rounded-xl text-foreground"
        />
      </div>
      
      <div className="flex gap-4">
        <Select 
          value={searchParams.get('year') || 'all'} 
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[140px] h-12 rounded-xl bg-background/50">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={searchParams.get('sort') || 'newest'} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[160px] h-12 rounded-xl bg-background/50">
            <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
