'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { GalleryMediaRow, GalleryCategory } from '@/types/gallery'
import type { Database } from '@/types/database'
import { updateGalleryMedia } from '@/actions/gallery'
import { toast } from 'sonner'
import { Loader2, Star, Eye, EyeOff, User, Globe, HelpCircle } from 'lucide-react'

type CategoryRow = Database["public"]["Tables"]["gallery_categories"]["Row"]
type ExhibitionRow = Pick<Database["public"]["Tables"]["exhibitions"]["Row"], "id" | "theme_en" | "theme_bn" | "year" | "status">

interface MetadataEditorProps {
  media: GalleryMediaRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
  categories: CategoryRow[]
  exhibitions: ExhibitionRow[]
}

export function MetadataEditor({ media, open, onOpenChange, onSaved, categories, exhibitions }: MetadataEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<GalleryMediaRow>>({})
  const [exhibitionAssociation, setExhibitionAssociation] = useState<"associate" | "independent">("independent")

  // Initialize form when item changes
  useEffect(() => {
    if (media) {
      setFormData(media)
      setExhibitionAssociation(media.exhibition_id ? "associate" : "independent")
    }
  }, [media])

  // Handle controlled input changes safely when initialized
  if (!media) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Prepare updates mapping association
      const updates: Partial<GalleryMediaRow> = {
        ...formData,
        exhibition_id: exhibitionAssociation === "associate" && formData.exhibition_id !== "none" ? formData.exhibition_id : null,
        // Map visibility changes directly to status
        status: formData.visibility === "public" ? "published" : "draft"
      }

      // 2. Trigger server action
      const result = await updateGalleryMedia(media.id, updates)
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

  // Filter exhibitions by status
  const ongoingEx = exhibitions.filter(e => e.status === "ongoing")
  const upcomingEx = exhibitions.filter(e => e.status === "upcoming")
  const archivedEx = exhibitions.filter(e => e.status !== "ongoing" && e.status !== "upcoming" && e.status !== "draft")
  const draftEx = exhibitions.filter(e => e.status === "draft")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-zinc-950 border border-border/40 shadow-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto z-50 text-foreground focus:outline-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Media Metadata</DialogTitle>
          <DialogDescription className="text-muted-foreground">Update the details, accessibility tags, exhibition link, and visibility for this asset.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          
          {/* Left Column - Core Data */}
          <div className="space-y-4">
            
            {/* Title (English) */}
            <div className="space-y-1.5">
              <Label htmlFor="edit_title_en" className="text-sm font-medium">Title — English <span className="text-destructive">*</span></Label>
              <Input 
                id="edit_title_en"
                value={formData.title_en || formData.caption_en || ''} 
                onChange={e => setFormData(p => ({ ...p, title_en: e.target.value, caption_en: e.target.value }))}
                placeholder="Media Title (English)"
                className="h-10 bg-background/50 border-border/50 focus-visible:ring-accent"
              />
            </div>

            {/* Title (Bengali) */}
            <div className="space-y-1.5">
              <Label htmlFor="edit_title_bn" className="text-sm font-medium">শিরোনাম — বাংলা</Label>
              <Input 
                id="edit_title_bn"
                value={formData.title_bn || formData.caption_bn || ''} 
                onChange={e => setFormData(p => ({ ...p, title_bn: e.target.value, caption_bn: e.target.value }))}
                placeholder="মিডিয়া শিরোনাম (বাংলা)"
                className="h-10 bg-background/50 border-border/50 focus-visible:ring-accent"
                dir="auto"
              />
            </div>

            {/* Description (English) */}
            <div className="space-y-1.5">
              <Label htmlFor="edit_desc_en" className="text-sm font-medium">Description — English</Label>
              <Textarea 
                id="edit_desc_en"
                value={formData.description_en || ''} 
                onChange={e => setFormData(p => ({ ...p, description_en: e.target.value }))}
                placeholder="Full description (English)..."
                className="resize-none h-24 bg-background/50 border-border/50 focus-visible:ring-accent"
              />
            </div>

            {/* Description (Bengali) */}
            <div className="space-y-1.5">
              <Label htmlFor="edit_desc_bn" className="text-sm font-medium">বর্ণনা — বাংলা</Label>
              <Textarea 
                id="edit_desc_bn"
                value={formData.description_bn || ''} 
                onChange={e => setFormData(p => ({ ...p, description_bn: e.target.value }))}
                placeholder="মিডিয়া সম্পর্কিত বিবরণ (বাংলা)..."
                className="resize-none h-20 bg-background/50 border-border/50 focus-visible:ring-accent"
                dir="auto"
              />
            </div>

            {/* Alt Text */}
            <div className="space-y-1.5">
              <Label htmlFor="edit_alt_text" className="text-sm font-medium">Alt Text (Accessibility)</Label>
              <Input 
                id="edit_alt_text"
                value={formData.alt_text || ''} 
                onChange={e => setFormData(p => ({ ...p, alt_text: e.target.value }))}
                placeholder="Describe image for screen readers"
                className="h-10 bg-background/50 border-border/50 focus-visible:ring-accent"
              />
            </div>
          </div>

          {/* Right Column - Organization & Credits */}
          <div className="space-y-4">
            
            {/* Category selection */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val: GalleryCategory) => setFormData(p => ({ ...p, category: val }))}
              >
                <SelectTrigger className="h-10 bg-background/50 border-border/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-zinc-950 border border-border/60 text-foreground">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name_en} ({cat.name_bn})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exhibition Association */}
            <div className="space-y-2 border border-border/40 p-3.5 rounded-xl bg-muted/5">
              <Label className="text-xs font-mono uppercase tracking-wider text-accent">Exhibition Link</Label>
              <RadioGroup
                value={exhibitionAssociation}
                onValueChange={val => {
                  setExhibitionAssociation(val as any)
                  if (val === "independent") setFormData(p => ({ ...p, exhibition_id: "none" }))
                }}
                className="flex gap-4 mt-1.5 mb-3"
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="associate" id="edit_r_associate" />
                  <Label htmlFor="edit_r_associate" className="text-xs cursor-pointer">Exhibition</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="independent" id="edit_r_independent" />
                  <Label htmlFor="edit_r_independent" className="text-xs cursor-pointer">Independent</Label>
                </div>
              </RadioGroup>

              {exhibitionAssociation === "associate" && (
                <Select 
                  value={formData.exhibition_id || 'none'} 
                  onValueChange={val => setFormData(p => ({ ...p, exhibition_id: val }))}
                >
                  <SelectTrigger className="h-10 bg-background/50 border-border/50">
                    <SelectValue placeholder="Select exhibition..." />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-zinc-950 border border-border/60 text-foreground max-h-[250px]">
                    <SelectItem value="none" disabled>Select exhibition...</SelectItem>
                    {ongoingEx.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-emerald-400 font-mono text-[9px] uppercase tracking-wider">Ongoing</SelectLabel>
                        {ongoingEx.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {upcomingEx.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-blue-400 font-mono text-[9px] uppercase tracking-wider">Upcoming</SelectLabel>
                        {upcomingEx.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {archivedEx.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider">Archived</SelectLabel>
                        {archivedEx.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {draftEx.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-amber-500 font-mono text-[9px] uppercase tracking-wider">Draft</SelectLabel>
                        {draftEx.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en} (Draft)</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Visibility Settings */}
            <div className="space-y-2 border border-border/40 p-3.5 rounded-xl bg-muted/5">
              <Label className="text-xs font-mono uppercase tracking-wider text-accent">Visibility</Label>
              <RadioGroup
                value={formData.visibility || 'public'}
                onValueChange={(val: 'public' | 'hidden') => setFormData(p => ({ ...p, visibility: val }))}
                className="grid grid-cols-2 gap-3 mt-1.5"
              >
                <div className={`flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/10 transition-colors cursor-pointer ${formData.visibility === 'public' ? 'bg-emerald-500/5 border-emerald-500/30' : ''}`} onClick={() => setFormData(p => ({ ...p, visibility: 'public' }))}>
                  <RadioGroupItem value="public" id="edit_v_public" />
                  <Label htmlFor="edit_v_public" className="text-xs flex items-center gap-1 cursor-pointer">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Public
                  </Label>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/10 transition-colors cursor-pointer ${formData.visibility === 'hidden' ? 'bg-rose-500/5 border-rose-500/30' : ''}`} onClick={() => setFormData(p => ({ ...p, visibility: 'hidden' }))}>
                  <RadioGroupItem value="hidden" id="edit_v_hidden" />
                  <Label htmlFor="edit_v_hidden" className="text-xs flex items-center gap-1 cursor-pointer">
                    <EyeOff className="w-3.5 h-3.5 text-rose-400" /> Hidden
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Credits (Photographer, Videographer, Copyright) */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="edit_photographer" className="text-xs font-medium text-muted-foreground">Photographer</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    id="edit_photographer"
                    value={formData.photographer || ''} 
                    onChange={e => setFormData(p => ({ ...p, photographer: e.target.value }))}
                    placeholder="Name"
                    className="h-9 pl-8 bg-background/50 border-border/50 text-xs focus-visible:ring-accent"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_videographer" className="text-xs font-medium text-muted-foreground">Videographer</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    id="edit_videographer"
                    value={formData.videographer || ''} 
                    onChange={e => setFormData(p => ({ ...p, videographer: e.target.value }))}
                    placeholder="Name"
                    className="h-9 pl-8 bg-background/50 border-border/50 text-xs focus-visible:ring-accent"
                  />
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="edit_copyright" className="text-xs font-medium text-muted-foreground">Copyright License</Label>
                <Input 
                  id="edit_copyright"
                  value={formData.copyright || ''} 
                  onChange={e => setFormData(p => ({ ...p, copyright: e.target.value }))}
                  placeholder="e.g. © 2026 Rongdhono"
                  className="h-9 bg-background/50 border-border/50 text-xs focus-visible:ring-accent"
                />
              </div>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <Label htmlFor="edit_sort_order" className="text-sm font-medium">Display Sort Order</Label>
              <Input 
                id="edit_sort_order"
                type="number"
                value={formData.sort_order || 0} 
                onChange={e => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                className="h-10 bg-background/50 border-border/50 focus-visible:ring-accent"
              />
            </div>

            {/* Featured Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Star className={`w-4 h-4 ${formData.is_featured ? 'text-amber-400 fill-amber-400/30' : 'text-muted-foreground'}`} />
                  Featured Media
                </Label>
                <p className="text-[10px] text-muted-foreground">Highlight and pin this asset to the gallery homepage.</p>
              </div>
              <Switch 
                checked={formData.is_featured || false} 
                onCheckedChange={val => setFormData(p => ({ ...p, is_featured: val }))}
              />
            </div>

          </div>
        </div>

        <DialogFooter className="mt-6 border-t border-border/40 pt-4 flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving} className="hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.title_en?.trim()} className="bg-accent text-black hover:bg-accent/90 rounded-xl px-5 font-semibold">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
