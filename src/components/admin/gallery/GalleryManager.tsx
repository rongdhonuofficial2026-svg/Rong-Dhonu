'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GalleryGrid } from './GalleryGrid'
import type { GalleryMediaWithExhibition, GalleryCategory } from '@/types/gallery'
import type { Database } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Search, Filter, Upload, X, Trash2, CheckSquare, Settings } from 'lucide-react'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bulkDeleteGalleryMedia, bulkUpdateGalleryStatus } from '@/actions/gallery'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface GalleryManagerProps {
  initialMedia: GalleryMediaWithExhibition[]
  categories: Database['public']['Tables']['gallery_categories']['Row'][]
}

export function GalleryManager({ initialMedia, categories }: GalleryManagerProps) {
  const [media, setMedia] = useState<GalleryMediaWithExhibition[]>(initialMedia)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkActioning, setIsBulkActioning] = useState(false)
  const router = useRouter()

  // Filter media
  const filteredMedia = useMemo(() => {
    return media.filter(m => {
      const matchesSearch = !search || 
        (m.caption_en || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.caption_bn || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.category || '').toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = filterCategory === 'all' || m.category === filterCategory
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [media, search, filterCategory, filterStatus])

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMedia.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredMedia.map(m => m.id))
    }
  }

  const handleBulkStatus = async (status: 'published' | 'draft' | 'archived') => {
    if (selectedIds.length === 0) return
    setIsBulkActioning(true)
    toast.loading(`Moving ${selectedIds.length} items to ${status}...`, { id: 'bulk' })
    const res = await bulkUpdateGalleryStatus(selectedIds, status)
    if (res.success) {
      toast.success(`Successfully updated ${selectedIds.length} items to ${status}`, { id: 'bulk' })
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error(res.error || 'Bulk update failed', { id: 'bulk' })
    }
    setIsBulkActioning(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} items?`)) return
    
    setIsBulkActioning(true)
    toast.loading(`Deleting ${selectedIds.length} items...`, { id: 'bulk' })
    
    const itemsToDelete = selectedIds.map(id => {
      const item = media.find(m => m.id === id)
      return { id, url: item?.url || '' }
    })

    const res = await bulkDeleteGalleryMedia(itemsToDelete)
    if (res.success) {
      toast.success(`Successfully deleted ${selectedIds.length} items`, { id: 'bulk' })
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error(res.error || 'Bulk delete failed', { id: 'bulk' })
    }
    setIsBulkActioning(false)
  }

  useEffect(() => {
    setMedia(initialMedia)
  }, [initialMedia])

  return (
    <div className="space-y-8">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-background/50 backdrop-blur-xl p-4 rounded-2xl border border-border/40 museum-shadow">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search media..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 focus-visible:ring-accent"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.slug}>{c.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <PremiumButton 
            variant="glass"
            leftIcon={<Settings className="w-4 h-4" />}
            onClick={() => router.push('/admin/gallery/categories')}
          >
            Categories
          </PremiumButton>
          <PremiumButton 
            variant="primary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => router.push('/admin/exhibitions')}
          >
            Upload via Exhibitions
          </PremiumButton>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 bg-accent/90 backdrop-blur-xl border border-accent/20 rounded-xl p-3 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-4 text-black">
            <span className="font-serif font-bold text-lg px-2">{selectedIds.length} Selected</span>
            <div className="h-6 w-px bg-black/20" />
            <Button variant="ghost" size="sm" className="text-black hover:bg-black/10" onClick={handleSelectAll}>
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedIds.length === filteredMedia.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkStatus('published')} disabled={isBulkActioning}>
              Publish
            </Button>
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkStatus('archived')} disabled={isBulkActioning}>
              Archive
            </Button>
            <Button size="sm" variant="outline" className="bg-rose-500/20 border-rose-500/30 text-rose-900 hover:bg-rose-500 hover:text-white" onClick={handleBulkDelete} disabled={isBulkActioning}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <GalleryGrid 
        media={filteredMedia} 
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAll={() => handleSelectAll()}
        categories={categories}
      />
    </div>
  )
}
