'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GalleryGrid } from './GalleryGrid'
import type { GalleryMediaWithExhibition } from '@/types/gallery'
import type { Database } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Search, Filter, Upload, Trash2, CheckSquare, Settings, Plus } from 'lucide-react'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  bulkDeleteGalleryMedia, 
  bulkUpdateGalleryStatus,
  bulkMoveGalleryMediaToAlbum,
  bulkChangeGalleryMediaCategory,
  bulkFeatureGalleryMedia
} from '@/actions/gallery'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface GalleryManagerProps {
  initialMedia: GalleryMediaWithExhibition[]
  categories: Database['public']['Tables']['gallery_categories']['Row'][]
  exhibitions: any[]
  albums: any[]
}

export function GalleryManager({ initialMedia, categories, exhibitions, albums }: GalleryManagerProps) {
  const [media, setMedia] = useState<GalleryMediaWithExhibition[]>(initialMedia)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const [filterAlbum, setFilterAlbum] = useState<string>('all')
  const [filterExhibition, setFilterExhibition] = useState<string>('all')
  const [filterFeatured, setFilterFeatured] = useState<string>('all')
  const [filterMediaType, setFilterMediaType] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterPhotographer, setFilterPhotographer] = useState<string>('all')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkActioning, setIsBulkActioning] = useState(false)
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const router = useRouter()

  // Generate dynamic unique years, photographers, videographers for advanced filtering
  const uniqueYears = useMemo(() => {
    const years = new Set<string>()
    media.forEach(m => {
      if (m.exhibitions?.year) years.add(String(m.exhibitions.year))
      else if (m.created_at) years.add(new Date(m.created_at).getFullYear().toString())
    })
    return Array.from(years).sort().reverse()
  }, [media])

  const uniquePhotographers = useMemo(() => {
    const photographers = new Set<string>()
    media.forEach(m => {
      if (m.photographer) photographers.add(m.photographer)
    })
    return Array.from(photographers).sort()
  }, [media])

  const uniqueVideographers = useMemo(() => {
    const videographers = new Set<string>()
    media.forEach(m => {
      if (m.videographer) videographers.add(m.videographer)
    })
    return Array.from(videographers).sort()
  }, [media])

  // Filter media
  const filteredMedia = useMemo(() => {
    return media.filter(m => {
      const album = albums.find(a => a.id === m.gallery_album_id)
      
      const matchesSearch = !search || 
        (m.title_en || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.title_bn || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.caption_en || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.caption_bn || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.photographer || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.videographer || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.original_file_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (album?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.category || '').toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = filterCategory === 'all' || m.category === filterCategory
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus
      const matchesAlbum = filterAlbum === 'all' || m.gallery_album_id === filterAlbum
      const matchesExhibition = filterExhibition === 'all' || m.exhibition_id === filterExhibition
      const matchesMediaType = filterMediaType === 'all' || m.media_type === filterMediaType
      
      const matchesFeatured = filterFeatured === 'all' || 
        (filterFeatured === 'featured' && (m.featured === true || m.is_featured === true)) ||
        (filterFeatured === 'non-featured' && (m.featured !== true && m.is_featured !== true))

      const matchesYear = filterYear === 'all' || 
        (m.exhibitions?.year && String(m.exhibitions.year) === filterYear) ||
        (!m.exhibitions?.year && m.created_at && new Date(m.created_at).getFullYear().toString() === filterYear)

      const matchesPhotographer = filterPhotographer === 'all' || 
        m.photographer === filterPhotographer || 
        m.videographer === filterPhotographer

      return matchesSearch && matchesCategory && matchesStatus && matchesAlbum && 
             matchesExhibition && matchesFeatured && matchesMediaType && matchesYear && matchesPhotographer
    })
  }, [media, search, filterCategory, filterStatus, filterAlbum, filterExhibition, filterFeatured, filterMediaType, filterYear, filterPhotographer, albums])

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

  const handleBulkMoveAlbum = async (albumId: string) => {
    if (selectedIds.length === 0 || albumId === 'none') return
    setIsBulkActioning(true)
    toast.loading(`Moving ${selectedIds.length} items to album...`, { id: 'bulk' })
    const res = await bulkMoveGalleryMediaToAlbum(selectedIds, albumId)
    if (res.success) {
      toast.success(`Successfully moved ${selectedIds.length} items`, { id: 'bulk' })
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error(res.error || 'Bulk move failed', { id: 'bulk' })
    }
    setIsBulkActioning(false)
  }

  const handleBulkCategory = async (category: string) => {
    if (selectedIds.length === 0 || category === 'none') return
    setIsBulkActioning(true)
    toast.loading(`Changing category of ${selectedIds.length} items...`, { id: 'bulk' })
    const res = await bulkChangeGalleryMediaCategory(selectedIds, category)
    if (res.success) {
      toast.success(`Successfully updated category for ${selectedIds.length} items`, { id: 'bulk' })
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error(res.error || 'Bulk category update failed', { id: 'bulk' })
    }
    setIsBulkActioning(false)
  }

  const handleBulkFeature = async (featured: boolean) => {
    if (selectedIds.length === 0) return
    setIsBulkActioning(true)
    toast.loading(`${featured ? 'Featuring' : 'Unfeaturing'} ${selectedIds.length} items...`, { id: 'bulk' })
    const res = await bulkFeatureGalleryMedia(selectedIds, featured)
    if (res.success) {
      toast.success(`Successfully updated feature status for ${selectedIds.length} items`, { id: 'bulk' })
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error(res.error || 'Bulk feature update failed', { id: 'bulk' })
    }
    setIsBulkActioning(false)
  }

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return
    toast.info(`Downloading ${selectedIds.length} files...`)
    for (const id of selectedIds) {
      const item = media.find(m => m.id === id)
      if (item?.url) {
        try {
          const a = document.createElement('a')
          a.href = item.url
          a.download = item.original_file_name || 'download'
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          // Small delay to prevent browser blocking multiple downloads
          await new Promise(r => setTimeout(r, 250))
        } catch (e) {
          console.error('Failed to trigger download for', item.url, e)
        }
      }
    }
  }

  useEffect(() => {
    setMedia(initialMedia)
  }, [initialMedia])

  return (
    <div className="space-y-8">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-4 bg-background/50 backdrop-blur-xl p-6 rounded-2xl border border-border/40 museum-shadow">
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search titles, artist, files..." 
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
                <SelectValue placeholder="Visibility / Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="admin-gallery-toolbar-actions shrink-0 flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <PremiumButton 
              variant="glass"
              leftIcon={<Settings className="w-4 h-4" />}
              onClick={() => router.push('/admin/gallery/albums')}
            >
              Albums
            </PremiumButton>
            <PremiumButton 
              variant="glass"
              leftIcon={<Settings className="w-4 h-4" />}
              onClick={() => router.push('/admin/gallery/categories')}
            >
              Categories
            </PremiumButton>
            <PremiumButton 
              variant="glass"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => router.push('/admin/exhibitions')}
            >
              Upload via Exhibitions
            </PremiumButton>
            <PremiumButton 
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/admin/gallery/new')}
            >
              Custom Upload
            </PremiumButton>
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div className="border-t border-border/40 pt-4 mt-2">
          <button
            type="button"
            onClick={() => setAdvancedFiltersOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 min-h-11 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3"
            aria-expanded={advancedFiltersOpen}
          >
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-accent" />
              Advanced Filters
            </span>
            <span className="text-[10px] normal-case tracking-normal">{advancedFiltersOpen ? 'Hide' : 'Show'}</span>
          </button>
          {advancedFiltersOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            <Select value={filterAlbum} onValueChange={setFilterAlbum}>
              <SelectTrigger className="h-9 bg-background/30 border-border/40 text-xs">
                <SelectValue placeholder="Filter by Album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albums.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterExhibition} onValueChange={setFilterExhibition}>
              <SelectTrigger className="h-9 bg-background/30 border-border/40 text-xs">
                <SelectValue placeholder="Filter by Exhibition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exhibitions</SelectItem>
                {exhibitions.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMediaType} onValueChange={setFilterMediaType}>
              <SelectTrigger className="h-9 bg-background/30 border-border/40 text-xs">
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Media</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFeatured} onValueChange={setFilterFeatured}>
              <SelectTrigger className="h-9 bg-background/30 border-border/40 text-xs">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="non-featured">Non-Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-9 bg-background/30 border-border/40 text-xs">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPhotographer} onValueChange={setFilterPhotographer}>
              <SelectTrigger className="h-9 bg-background/30 border-border/40 text-xs">
                <SelectValue placeholder="Photographer/Artist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Artists</SelectItem>
                {uniquePhotographers.map(p => (
                  <SelectItem key={p} value={p}>{p} (Photo)</SelectItem>
                ))}
                {uniqueVideographers.map(v => (
                  <SelectItem key={v} value={v}>{v} (Video)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 bg-accent/90 backdrop-blur-xl border border-accent/20 rounded-xl p-3 flex flex-wrap gap-3 items-center justify-between shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-4 text-black">
            <span className="font-serif font-bold text-lg px-2 shrink-0">{selectedIds.length} Selected</span>
            <div className="h-6 w-px bg-black/20 shrink-0" />
            <Button variant="ghost" size="sm" className="text-black hover:bg-black/10 shrink-0" onClick={handleSelectAll}>
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedIds.length === filteredMedia.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkStatus('published')} disabled={isBulkActioning}>
              Publish
            </Button>
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkStatus('draft')} disabled={isBulkActioning}>
              Hide
            </Button>
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkStatus('archived')} disabled={isBulkActioning}>
              Archive
            </Button>
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkFeature(true)} disabled={isBulkActioning}>
              Feature
            </Button>
            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={() => handleBulkFeature(false)} disabled={isBulkActioning}>
              Unfeature
            </Button>

            <Select onValueChange={handleBulkMoveAlbum} disabled={isBulkActioning}>
              <SelectTrigger className="h-9 bg-white/20 border-black/10 text-black hover:bg-white/40 text-xs w-[140px]">
                <SelectValue placeholder="Move to Album" />
              </SelectTrigger>
              <SelectContent>
                {albums.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleBulkCategory} disabled={isBulkActioning}>
              <SelectTrigger className="h-9 bg-white/20 border-black/10 text-black hover:bg-white/40 text-xs w-[140px]">
                <SelectValue placeholder="Change Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.slug}>{c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" variant="outline" className="bg-white/20 border-black/10 text-black hover:bg-white/40" onClick={handleBulkDownload}>
              Download
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
        exhibitions={exhibitions}
      />
    </div>
  )
}
