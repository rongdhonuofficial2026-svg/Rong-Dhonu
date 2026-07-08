'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Search, Plus, Settings, Edit, Eye, EyeOff, Trash2, Folder, 
  Image as ImageIcon, Video, Calendar, HardDrive, Layout, ChevronRight, Globe 
} from 'lucide-react'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createIndependentAlbum, updateGalleryAlbum, deleteGalleryAlbum } from '@/actions/gallery'

interface AlbumWithMedia {
  id: string
  exhibition_id: string | null
  category_slug: string | null
  album_type: 'exhibition' | 'independent'
  title: string
  title_en: string
  title_bn: string | null
  description_en: string | null
  description_bn: string | null
  slug: string
  is_featured: boolean
  status: 'draft' | 'published' | 'archived'
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  cover_media_id: string | null
  created_at: string
  updated_at: string
  gallery_media: {
    id: string
    media_type: 'image' | 'video'
    url: string
    size_bytes: number | null
    created_at: string
  }[]
}

interface AlbumManagerProps {
  initialAlbums: AlbumWithMedia[]
  categories: { id: string; slug: string; name_en: string }[]
}

export function AlbumManager({ initialAlbums, categories }: AlbumManagerProps) {
  const [albums, setAlbums] = useState<AlbumWithMedia[]>(initialAlbums)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // State for Create Independent Album
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    category_slug: categories[0]?.slug || 'artwork',
    is_featured: false
  })

  // State for Edit Album
  const [editingAlbum, setEditingAlbum] = useState<AlbumWithMedia | null>(null)
  const [editForm, setEditForm] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    category_slug: '',
    is_featured: false,
    status: 'published' as 'draft' | 'published' | 'archived',
    seo_title: '',
    seo_description: '',
    og_image_url: ''
  })

  // State for Cover Selector dialog
  const [selectingCoverForAlbum, setSelectingCoverForAlbum] = useState<AlbumWithMedia | null>(null)

  // Compute album statistics
  const albumsWithStats = useMemo(() => {
    return albums.map(album => {
      const media = album.gallery_media || []
      const photos = media.filter(m => m.media_type === 'image')
      const videos = media.filter(m => m.media_type === 'video')
      const totalSize = media.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0)
      
      let lastUpload: string | null = null
      if (media.length > 0) {
        const dates = media.map(m => new Date(m.created_at).getTime())
        lastUpload = new Date(Math.max(...dates)).toISOString()
      }

      // Determine cover image based on priority: cover_media_id -> featured image -> first uploaded
      let coverUrl = '/images/album_placeholder.png'
      if (album.cover_media_id) {
        const matchingCover = media.find(m => m.id === album.cover_media_id)
        if (matchingCover) coverUrl = matchingCover.url
      } else if (media.length > 0) {
        // Look for featured image
        const featured = media.find(m => m.id === album.cover_media_id) // placeholder, in case
        if (featured) coverUrl = featured.url
        else coverUrl = media[0].url // fallback to first upload
      }

      return {
        ...album,
        stats: {
          total: media.length,
          photos: photos.length,
          videos: videos.length,
          sizeFormatted: (totalSize / (1024 * 1024)).toFixed(1) + ' MB',
          lastUpload
        },
        coverUrl
      }
    })
  }, [albums])

  // Filtered albums based on search & type
  const filteredAlbums = useMemo(() => {
    return albumsWithStats.filter(album => {
      const matchesSearch = !search || 
        album.title_en.toLowerCase().includes(search.toLowerCase()) ||
        (album.title_bn || '').toLowerCase().includes(search.toLowerCase()) ||
        album.slug.toLowerCase().includes(search.toLowerCase())

      const matchesType = filterType === 'all' || album.album_type === filterType
      return matchesSearch && matchesType
    })
  }, [albumsWithStats, search, filterType])

  // Handle Create Independent Album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.title_en.trim()) {
      toast.error('English Title is required')
      return
    }
    
    setIsSubmitting(true)
    const res = await createIndependentAlbum(createForm)
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Album created successfully')
      setIsCreateOpen(false)
      setCreateForm({
        title_en: '',
        title_bn: '',
        description_en: '',
        description_bn: '',
        category_slug: categories[0]?.slug || 'artwork',
        is_featured: false
      })
      router.refresh()
    } else {
      toast.error(res.error || 'Failed to create album')
    }
  }

  // Handle Open Edit Modal
  const openEditModal = (album: AlbumWithMedia) => {
    setEditingAlbum(album)
    setEditForm({
      title_en: album.title_en || '',
      title_bn: album.title_bn || '',
      description_en: album.description_en || '',
      description_bn: album.description_bn || '',
      category_slug: album.category_slug || '',
      is_featured: album.is_featured === true,
      status: album.status || 'published',
      seo_title: album.seo_title || '',
      seo_description: album.seo_description || '',
      og_image_url: album.og_image_url || ''
    })
  }

  // Handle Update Album
  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAlbum) return
    if (!editForm.title_en.trim()) {
      toast.error('English Title is required')
      return
    }

    setIsSubmitting(true)
    const res = await updateGalleryAlbum(editingAlbum.id, editForm)
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Album updated successfully')
      setEditingAlbum(null)
      router.refresh()
    } else {
      toast.error(res.error || 'Failed to update album')
    }
  }

  // Handle Delete Album
  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Are you sure you want to delete this album? This will also delete all files in it permanently.')) return

    toast.loading('Deleting album...', { id: 'delete' })
    const res = await deleteGalleryAlbum(albumId)
    if (res.success) {
      toast.success('Album deleted successfully', { id: 'delete' })
      router.refresh()
    } else {
      toast.error(res.error || 'Failed to delete album', { id: 'delete' })
    }
  }

  // Handle Set Cover Media
  const handleSelectCover = async (mediaId: string | null) => {
    if (!selectingCoverForAlbum) return
    toast.loading('Updating cover...', { id: 'cover' })
    const res = await updateGalleryAlbum(selectingCoverForAlbum.id, {
      ...selectingCoverForAlbum,
      cover_media_id: mediaId
    })
    if (res.success) {
      toast.success('Cover image updated successfully', { id: 'cover' })
      setSelectingCoverForAlbum(null)
      router.refresh()
    } else {
      toast.error(res.error || 'Failed to update cover', { id: 'cover' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-background/50 backdrop-blur-xl p-4 rounded-2xl border border-border/40 museum-shadow">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search albums by title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 focus-visible:ring-accent"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Album Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Album Types</SelectItem>
              <SelectItem value="exhibition">Exhibition Albums</SelectItem>
              <SelectItem value="independent">Independent Albums</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <PremiumButton 
            variant="glass"
            leftIcon={<Layout className="w-4 h-4" />}
            onClick={() => router.push('/admin/gallery')}
          >
            Media Manager
          </PremiumButton>
          <PremiumButton 
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Independent Album
          </PremiumButton>
        </div>
      </div>

      {/* Grid of Albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.map(album => (
          <div 
            key={album.id} 
            className="group relative flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Cover Image Container */}
            <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-950 overflow-hidden shrink-0">
              <Image 
                src={album.coverUrl}
                alt={album.title_en}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              {/* Type Badge */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge variant={album.album_type === 'exhibition' ? 'default' : 'secondary'} className="uppercase font-mono text-[9px] tracking-wider font-semibold">
                  {album.album_type}
                </Badge>
                {album.is_featured && (
                  <Badge className="bg-amber-500 text-neutral-900 border-none font-mono text-[9px] tracking-wider">
                    FEATURED
                  </Badge>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {album.status === 'published' ? (
                  <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <Eye className="w-3 h-3 mr-1" /> Published
                  </Badge>
                ) : album.status === 'draft' ? (
                  <Badge variant="outline" className="bg-neutral-500/10 text-neutral-500">
                    <EyeOff className="w-3 h-3 mr-1" /> Hidden (Draft)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-rose-500/20 text-rose-600 border-rose-500/30">
                    Archived
                  </Badge>
                )}
              </div>

              {/* Title & Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif text-lg font-bold line-clamp-1">{album.title_en}</h3>
                {album.title_bn && (
                  <p className="text-xs text-white/70 font-sans mt-0.5 line-clamp-1">{album.title_bn}</p>
                )}
              </div>
            </div>

            {/* Album details & Stats */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {album.description_en || 'No English description provided.'}
                </p>
                
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Assets: <strong className="text-neutral-900 dark:text-white">{album.stats.total}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Size: <strong className="text-neutral-900 dark:text-white">{album.stats.sizeFormatted}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Photos: <strong className="text-neutral-900 dark:text-white">{album.stats.photos}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Videos: <strong className="text-neutral-900 dark:text-white">{album.stats.videos}</strong></span>
                  </div>
                </div>

                {album.stats.lastUpload && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Last Upload: {new Date(album.stats.lastUpload).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-5 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => openEditModal(album)}
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Info
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => setSelectingCoverForAlbum(album)}
                  disabled={album.stats.total === 0}
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Set Cover
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 p-2 border-rose-100 dark:border-rose-950 shrink-0"
                  onClick={() => handleDeleteAlbum(album.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredAlbums.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <Folder className="w-12 h-12 text-muted-foreground/45 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-200">No Albums Found</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              No albums matched your current search parameters. Create a new independent album or upload media via exhibitions.
            </p>
          </div>
        )}
      </div>

      {/* CREATE INDEPENDENT ALBUM DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2">
              <Folder className="w-5 h-5 text-accent" />
              Create Independent Album
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Create an album not tied to any exhibition. Slugs are auto-generated from the English title.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAlbum} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="c_title_en" className="text-xs font-semibold text-neutral-700">Album Title (English) <span className="text-destructive">*</span></label>
              <Input 
                id="c_title_en" 
                value={createForm.title_en}
                onChange={e => setCreateForm(prev => ({ ...prev, title_en: e.target.value }))}
                placeholder="e.g. Masterclass Workshop 2026"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="c_title_bn" className="text-xs font-semibold text-neutral-700">Album Title (Bengali)</label>
              <Input 
                id="c_title_bn" 
                value={createForm.title_bn}
                onChange={e => setCreateForm(prev => ({ ...prev, title_bn: e.target.value }))}
                placeholder="যেমন: মাস্টারক্লাস কর্মশালা ২০২৬"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="c_desc_en" className="text-xs font-semibold text-neutral-700">Description (English)</label>
              <Textarea 
                id="c_desc_en" 
                value={createForm.description_en}
                onChange={e => setCreateForm(prev => ({ ...prev, description_en: e.target.value }))}
                placeholder="English description for the public page..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="c_desc_bn" className="text-xs font-semibold text-neutral-700">Description (Bengali)</label>
              <Textarea 
                id="c_desc_bn" 
                value={createForm.description_bn}
                onChange={e => setCreateForm(prev => ({ ...prev, description_bn: e.target.value }))}
                placeholder="বাংলা বিবরণ..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Category Classification</label>
              <Select 
                value={createForm.category_slug}
                onValueChange={val => setCreateForm(prev => ({ ...prev, category_slug: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.slug}>{c.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-700">Feature Album</span>
                <span className="text-[10px] text-muted-foreground">Highlight this album in the public gallery view.</span>
              </div>
              <Switch 
                checked={createForm.is_featured}
                onCheckedChange={checked => setCreateForm(prev => ({ ...prev, is_featured: checked }))}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-neutral-100">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Album'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT ALBUM DIALOG */}
      <Dialog open={!!editingAlbum} onOpenChange={open => !open && setEditingAlbum(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2">
              <Edit className="w-5 h-5 text-accent" />
              Edit Album Metadata
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Configure bilingual description details, SEO tags, visibility options, and feature highlighting.
            </DialogDescription>
          </DialogHeader>

          {editingAlbum && (
            <form onSubmit={handleUpdateAlbum} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Album Title (English) <span className="text-destructive">*</span></label>
                <Input 
                  value={editForm.title_en}
                  onChange={e => setEditForm(prev => ({ ...prev, title_en: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Album Title (Bengali)</label>
                <Input 
                  value={editForm.title_bn}
                  onChange={e => setEditForm(prev => ({ ...prev, title_bn: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Description (English)</label>
                <Textarea 
                  value={editForm.description_en}
                  onChange={e => setEditForm(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Description (Bengali)</label>
                <Textarea 
                  value={editForm.description_bn}
                  onChange={e => setEditForm(prev => ({ ...prev, description_bn: e.target.value }))}
                  rows={2}
                />
              </div>

              {editingAlbum.album_type === 'independent' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Category Classification</label>
                  <Select 
                    value={editForm.category_slug}
                    onValueChange={val => setEditForm(prev => ({ ...prev, category_slug: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.slug}>{c.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Visibility Status</label>
                  <Select 
                    value={editForm.status}
                    onValueChange={val => setEditForm(prev => ({ ...prev, status: val as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published (Public)</SelectItem>
                      <SelectItem value="draft">Hidden (Draft)</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-700">Feature Album</span>
                    <span className="text-[9px] text-muted-foreground">Showcase on public home.</span>
                  </div>
                  <Switch 
                    checked={editForm.is_featured}
                    onCheckedChange={checked => setEditForm(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
              </div>

              {/* SEO Block */}
              <div className="border-t border-neutral-100 pt-4 mt-6 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  SEO & Social Settings
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-600">SEO Custom Title</label>
                  <Input 
                    value={editForm.seo_title}
                    onChange={e => setEditForm(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="Defaults to album title"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-600">SEO Custom Description</label>
                  <Textarea 
                    value={editForm.seo_description}
                    onChange={e => setEditForm(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Bilingual fallback or main summary"
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-600">OG / Social Shared Image URL</label>
                  <Input 
                    value={editForm.og_image_url}
                    onChange={e => setEditForm(prev => ({ ...prev, og_image_url: e.target.value }))}
                    placeholder="e.g. https://... or leave blank for cover"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-neutral-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingAlbum(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* COVER IMAGE SELECTOR DIALOG */}
      <Dialog open={!!selectingCoverForAlbum} onOpenChange={open => !open && setSelectingCoverForAlbum(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2 shrink-0">
              <ImageIcon className="w-5 h-5 text-accent" />
              Select Album Cover Override
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 shrink-0">
              Choose an image from this album to serve as its explicit cover override instead of auto-fallbacks.
            </DialogDescription>
          </DialogHeader>

          {selectingCoverForAlbum && (
            <div className="flex-1 overflow-y-auto py-4">
              {selectingCoverForAlbum.gallery_media.filter(m => m.media_type === 'image').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  This album does not contain any images yet. Only images can be chosen as album covers.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {/* Reset cover button */}
                  <div 
                    className="aspect-square flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-200 hover:border-accent rounded-xl cursor-pointer hover:bg-neutral-50 transition-all text-center"
                    onClick={() => handleSelectCover(null)}
                  >
                    <Folder className="w-6 h-6 text-muted-foreground/75 mb-2" />
                    <span className="text-xs font-semibold text-neutral-700">Clear Cover Override</span>
                    <span className="text-[9px] text-muted-foreground mt-1">Reset to automatic fallback</span>
                  </div>

                  {selectingCoverForAlbum.gallery_media
                    .filter(m => m.media_type === 'image')
                    .map(img => (
                      <div 
                        key={img.id}
                        className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          selectingCoverForAlbum.cover_media_id === img.id 
                            ? 'border-accent ring-2 ring-accent/30' 
                            : 'border-transparent hover:border-accent/40'
                        }`}
                        onClick={() => handleSelectCover(img.id)}
                      >
                        <Image 
                          src={img.url}
                          alt="Cover option"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {selectingCoverForAlbum.cover_media_id === img.id && (
                          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                            <Badge className="bg-accent text-white">Current Cover</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-neutral-100 shrink-0">
            <Button variant="outline" onClick={() => setSelectingCoverForAlbum(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
