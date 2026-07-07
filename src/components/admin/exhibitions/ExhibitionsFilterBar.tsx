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
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 relative">
        <Input 
          placeholder="Search by theme or venue..." 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          className="pl-10 h-12 bg-white/5 border-border/50 text-foreground"
        />
        <Search className="w-4 h-4 absolute left-4 top-4 text-muted-foreground" />
        <PremiumButton type="submit" variant="secondary" className="px-6 h-12">Search</PremiumButton>
      </form>

      <div className="flex items-center gap-4">
        <Select value={currentStatus} onValueChange={(v) => handleSelectChange('status', v)}>
          <SelectTrigger className="w-[140px] h-12 bg-white/5 border-border/50 text-foreground">
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
          <SelectTrigger className="w-[160px] h-12 bg-white/5 border-border/50 text-foreground">
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
