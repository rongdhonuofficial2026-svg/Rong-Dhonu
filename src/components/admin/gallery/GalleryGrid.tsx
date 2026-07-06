'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PlayCircle, Image as ImageIcon, Edit2, Trash2, CheckCircle2, Star, MoreVertical, ShieldAlert } from 'lucide-react'
import { LuxuryCard } from '@/components/admin/ui/LuxuryCard'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { deleteGalleryMedia, updateGalleryMedia } from '@/actions/gallery'
import type { GalleryMediaWithExhibition } from '@/types/gallery'
import type { Database } from '@/types/database'
import { toast } from 'sonner'
import { MetadataEditor } from './MetadataEditor'

interface GalleryGridProps {
  media: GalleryMediaWithExhibition[]
  selectedIds: string[]
  onSelectToggle: (id: string) => void
  onSelectAll: () => void
  categories: Database['public']['Tables']['gallery_categories']['Row'][]
}

export function GalleryGrid({ media, selectedIds, onSelectToggle, onSelectAll, categories }: GalleryGridProps) {
  const [editingItem, setEditingItem] = useState<GalleryMediaWithExhibition | null>(null)

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this media? This will permanently remove it from the gallery.')) return
    
    toast.loading('Deleting media...', { id: 'delete' })
    const res = await deleteGalleryMedia(id, url)
    if (res.success) {
      toast.success('Media deleted', { id: 'delete' })
    } else {
      toast.error(res.error || 'Failed to delete', { id: 'delete' })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === 'published' ? 'archived' : 'published'
    const res = await updateGalleryMedia(id, { status: newStatus })
    if (res.success) {
      toast.success(`Media marked as ${newStatus}`)
    } else {
      toast.error('Failed to update status')
    }
  }

  const handleToggleFeature = async (id: string, currentlyFeatured: boolean) => {
    const res = await updateGalleryMedia(id, { is_featured: !currentlyFeatured })
    if (res.success) {
      toast.success(currentlyFeatured ? 'Removed from featured' : 'Marked as featured')
    } else {
      toast.error('Failed to update featured status')
    }
  }

  if (!media || media.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-background/30 backdrop-blur-md rounded-3xl border border-border/40">
        <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6 mx-auto bg-muted/20">
          <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h3 className="font-serif text-2xl mb-2 text-foreground">The gallery is empty</h3>
        <p className="text-muted-foreground">Upload the first pieces of media to begin curating the public exhibition.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {media.map((item) => {
          const isSelected = selectedIds.includes(item.id)
          const isPublished = item.status === 'published'

          return (
            <LuxuryCard 
              key={item.id} 
              padding="none" 
              className={`overflow-hidden group relative transition-all duration-300 ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
            >
              {/* Selection Overlay & Checkbox */}
              <div 
                className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                onClick={(e) => { e.stopPropagation(); onSelectToggle(item.id) }}
              >
                <div className="bg-background/80 backdrop-blur-md p-1 rounded border border-border/50">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelectToggle(item.id)}
                  />
                </div>
              </div>

              {/* Status Badges */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                {!isPublished && (
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-amber-500/90 text-black shadow-sm">
                    {item.status}
                  </span>
                )}
                {item.is_featured && (
                  <span className="p-1 rounded bg-accent/90 text-black shadow-sm">
                    <Star className="w-3 h-3 fill-black" />
                  </span>
                )}
              </div>

              {/* Media Preview */}
              <div 
                className="relative aspect-[4/3] bg-black cursor-pointer"
                onClick={() => setEditingItem(item)}
              >
                {item.media_type === 'image' ? (
                  <Image 
                    src={item.url} 
                    alt={item.caption_en || "Gallery item"} 
                    fill 
                    className={`object-cover transition-all duration-700 ${!isPublished ? 'grayscale-[30%] opacity-60' : 'opacity-90'} group-hover:scale-110 group-hover:opacity-100`} 
                    sizes="(max-width: 768px) 50vw, 25vw" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-slate-900 text-white group-hover:scale-105 transition-transform duration-700">
                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <PlayCircle className="w-16 h-16 opacity-50 group-hover:opacity-100 group-hover:text-accent transition-all duration-300 relative z-10" />
                  </div>
                )}
                
                {/* Overlay Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  
                  {/* Action Menu */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 transform translate-y-[20px] opacity-0 group-hover:translate-y-[-50%] group-hover:opacity-100 transition-all duration-400 delay-75 z-30">
                    <PremiumButton 
                      variant="glass" size="icon" 
                      className="h-12 w-12 rounded-full backdrop-blur-xl bg-white/10 border-white/20 hover:bg-accent hover:text-black hover:border-accent"
                      onClick={(e) => { e.stopPropagation(); setEditingItem(item) }}
                    >
                      <Edit2 className="w-5 h-5" />
                    </PremiumButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <PremiumButton 
                          variant="glass" size="icon" 
                          className="h-12 w-12 rounded-full backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/30"
                          onClick={e => e.stopPropagation()}
                        >
                          <MoreVertical className="w-5 h-5 text-white" />
                        </PremiumButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                        <DropdownMenuItem onClick={() => handleToggleStatus(item.id, item.status)}>
                          {isPublished ? 'Archive Media' : 'Publish to Gallery'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeature(item.id, item.is_featured || false)}>
                          {item.is_featured ? 'Remove Feature' : 'Mark as Featured'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem 
                          className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                          onClick={() => handleDelete(item.id, item.url)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Bottom Text */}
                  <div className="transform translate-y-[10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100 relative z-20">
                    <p className="font-serif text-lg text-white mb-1 line-clamp-1">{item.caption_en || 'Untitled Artifact'}</p>
                    <div className="flex items-center justify-between">
                      {item.exhibitions?.theme_en && (
                        <p className="text-accent text-[10px] font-mono uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/10 inline-block">
                          {item.exhibitions.theme_en}
                        </p>
                      )}
                      {item.size_bytes && (
                        <p className="text-white/40 text-[10px] font-mono">
                          {(item.size_bytes / 1024 / 1024).toFixed(1)}MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </LuxuryCard>
          )
        })}
      </div>

      <MetadataEditor 
        media={editingItem} 
        open={!!editingItem} 
        onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}
        categories={categories}
      />
    </>
  )
}
