'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { GalleryMediaRow, GalleryCategory, GalleryMediaStatus } from '@/types/gallery'
import type { Database } from '@/types/database'
import { updateGalleryMedia } from '@/actions/gallery'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface MetadataEditorProps {
  media: GalleryMediaRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
  categories: Database['public']['Tables']['gallery_categories']['Row'][]
}

export function MetadataEditor({ media, open, onOpenChange, onSaved, categories }: MetadataEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<GalleryMediaRow>>({})

  // Initialize form when item changes
  useEffect(() => {
    if (media) setFormData(media)
  }, [media])

  // Handle controlled input changes safely when initialized
  if (!media) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateGalleryMedia(media.id, formData)
      if (result.success) {
        toast.success('Metadata updated successfully')
        onSaved?.()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to update metadata')
      }
    } catch (e) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border/40 backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Media Metadata</DialogTitle>
          <DialogDescription>Update the details, SEO tags, and visibility for this asset.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          
          {/* Left Column - Core Data */}
          <div className="space-y-4">

            
            <div className="space-y-2">
              <Label>Caption (English)</Label>
              <Textarea 
                value={formData.caption_en || ''} 
                onChange={e => setFormData(p => ({ ...p, caption_en: e.target.value }))}
                placeholder="Brief caption for the gallery grid..."
                className="resize-none h-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea 
                value={formData.description_en || ''} 
                onChange={e => setFormData(p => ({ ...p, description_en: e.target.value }))}
                placeholder="Full description for the lightbox view..."
                className="resize-none h-24"
              />
            </div>

            <div className="space-y-2">
              <Label>Alt Text (Accessibility & SEO)</Label>
              <Input 
                value={formData.alt_text || ''} 
                onChange={e => setFormData(p => ({ ...p, alt_text: e.target.value }))}
                placeholder="Describe the image for screen readers"
              />
            </div>
          </div>

          {/* Right Column - Organization */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val: GalleryCategory) => setFormData(p => ({ ...p, category: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status as string} 
                onValueChange={(val: GalleryMediaStatus) => setFormData(p => ({ ...p, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (Public)</SelectItem>
                  <SelectItem value="draft">Draft (Hidden)</SelectItem>
                  <SelectItem value="archived">Archived (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Photographer / Credit</Label>
              <Input 
                value={formData.photographer || ''} 
                onChange={e => setFormData(p => ({ ...p, photographer: e.target.value }))}
                placeholder="Name of photographer"
              />
            </div>

            <div className="space-y-2">
              <Label>Display Sort Order</Label>
              <Input 
                type="number"
                value={formData.sort_order || 0} 
                onChange={e => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-[10px] text-muted-foreground">Lower numbers appear first.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10 mt-4">
              <div className="space-y-0.5">
                <Label>Featured Media</Label>
                <p className="text-[10px] text-muted-foreground">Mark as a hero/highlight image.</p>
              </div>
              <Switch 
                checked={formData.is_featured || false} 
                onCheckedChange={val => setFormData(p => ({ ...p, is_featured: val }))}
              />
            </div>

          </div>
        </div>

        <DialogFooter className="mt-6 border-t border-border/40 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-black hover:bg-accent/90">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
