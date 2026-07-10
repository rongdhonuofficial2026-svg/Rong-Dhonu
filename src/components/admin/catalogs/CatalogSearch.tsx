'use client'

import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function CatalogSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get('query') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
          params.set('query', query)
        } else {
          params.delete('query')
        }
        router.push(`?${params.toString()}`, { scroll: false })
      })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, router, searchParams])

  return (
    <div className="relative w-full max-w-full sm:max-w-md sm:flex-1">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isPending ? 'text-amber-400 animate-pulse' : 'text-muted-foreground'}`} />
      <Input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search documents by title or exhibition..." 
        className="pl-11 w-full bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl h-11 min-h-11 text-foreground placeholder:text-muted-foreground/70"
      />
    </div>
  )
}
