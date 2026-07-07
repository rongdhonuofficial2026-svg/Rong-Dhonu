'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function CatalogFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') || 'all'

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
      <button 
        onClick={() => handleFilter('all')}
        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${currentStatus === 'all' ? 'bg-white/20 text-white font-medium' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5'}`}
      >
        All Documents
      </button>
      <button 
        onClick={() => handleFilter('published')}
        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${currentStatus === 'published' ? 'bg-white/20 text-white font-medium' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5'}`}
      >
        Published
      </button>
      <button 
        onClick={() => handleFilter('draft')}
        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${currentStatus === 'draft' ? 'bg-white/20 text-white font-medium' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5'}`}
      >
        Drafts
      </button>
    </div>
  )
}
