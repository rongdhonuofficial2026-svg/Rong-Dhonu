'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'

export function ExhibitionsFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get('q') || ''
  const currentStatus = searchParams.get('status') || 'all'
  const currentYear = searchParams.get('year') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'

  const [q, setQ] = useState(currentQ)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`?${createQueryString('q', q)}`)
  }

  const handleSelectChange = (key: string, value: string) => {
    router.push(`?${createQueryString(key, value)}`)
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="w-full flex flex-col sm:flex-row gap-2 relative">
        <div className="relative flex-1 w-full">
          <Input 
            placeholder="Search by theme or venue..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-10 h-12 w-full bg-white/5 border-border/50 text-foreground"
          />
          <Search className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />
        </div>
        <PremiumButton type="submit" variant="secondary" className="w-full sm:w-auto px-6 h-12 min-h-11">Search</PremiumButton>
      </form>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <Select value={currentStatus} onValueChange={(v) => handleSelectChange('status', v)}>
          <SelectTrigger className="w-full sm:w-[140px] h-12 min-h-11 bg-white/5 border-border/50 text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="trash">Trash (Deleted)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentSort} onValueChange={(v) => handleSelectChange('sort', v)}>
          <SelectTrigger className="w-full sm:w-[160px] h-12 min-h-11 bg-white/5 border-border/50 text-foreground">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="newest_created">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
