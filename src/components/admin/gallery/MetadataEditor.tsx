'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { PremiumSwitch } from '@/components/admin/ui/PremiumSwitch'
import { AdminSettingTile } from '@/components/admin/ui/AdminSettingTile'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { GalleryMediaRow, GalleryCategory } from '@/types/gallery'
import type { Database } from '@/types/database'
import { updateGalleryMedia } from '@/actions/gallery'
import { toast } from 'sonner'
import { Loader2, Star, Eye, EyeOff, User, Globe, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      setFormData({
        ...media,
        title_en: media.title_en ?? '',
        title_bn: media.title_bn ?? '',
        description_en: media.description_en ?? '',
        description_bn: media.description_bn ?? '',
        alt_text: media.alt_text ?? '',
        photographer: media.photographer ?? '',
        videographer: media.videographer ?? '',
        copyright: media.copyright ?? '',
      })
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
      <DialogContent className="max-w-5xl bg-white border border-neutral-200 shadow-2xl p-8 rounded-2xl max-h-[90vh] overflow-y-auto z-50 text-neutral-900 focus:outline-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900">Edit Media Metadata</DialogTitle>
          <DialogDescription className="text-sm text-neutral-500 mt-1">
            Update the details, accessibility tags, exhibition link, and visibility for this asset.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          
          {/* Left Column - Core Data */}
          <div className="space-y-5">
            
            {/* Title (English) */}
            <div className="space-y-2">
              <Label htmlFor="edit_title_en" className="text-sm font-semibold text-neutral-700">Title — English <span className="text-red-500">*</span></Label>
              <Input 
                id="edit_title_en"
                value={formData.title_en || formData.caption_en || ''} 
                onChange={e => setFormData(p => ({ ...p, title_en: e.target.value, caption_en: e.target.value }))}
                placeholder="Media Title (English)"
                className="h-11 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
              />
            </div>

            {/* Title (Bengali) */}
            <div className="space-y-2">
              <Label htmlFor="edit_title_bn" className="text-sm font-semibold text-neutral-700">শিরোনাম — বাংলা</Label>
              <Input 
                id="edit_title_bn"
                value={formData.title_bn || formData.caption_bn || ''} 
                onChange={e => setFormData(p => ({ ...p, title_bn: e.target.value, caption_bn: e.target.value }))}
                placeholder="মিডিয়া শিরোনাম (বাংলা)"
                className="h-11 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
                dir="auto"
              />
            </div>

            {/* Description (English) */}
            <div className="space-y-2">
              <Label htmlFor="edit_desc_en" className="text-sm font-semibold text-neutral-700">Description — English</Label>
              <Textarea 
                id="edit_desc_en"
                value={formData.description_en || ''} 
                onChange={e => setFormData(p => ({ ...p, description_en: e.target.value }))}
                placeholder="Full description (English)..."
                className="resize-none h-28 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
              />
            </div>

            {/* Description (Bengali) */}
            <div className="space-y-2">
              <Label htmlFor="edit_desc_bn" className="text-sm font-semibold text-neutral-700">বর্ণনা — বাংলা</Label>
              <Textarea 
                id="edit_desc_bn"
                value={formData.description_bn || ''} 
                onChange={e => setFormData(p => ({ ...p, description_bn: e.target.value }))}
                placeholder="মিডিয়া সম্পর্কিত বিবরণ (বাংলা)..."
                className="resize-none h-28 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
                dir="auto"
              />
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="edit_alt_text" className="text-sm font-semibold text-neutral-700">Alt Text (Accessibility)</Label>
              <Input 
                id="edit_alt_text"
                value={formData.alt_text || ''} 
                onChange={e => setFormData(p => ({ ...p, alt_text: e.target.value }))}
                placeholder="Describe image for screen readers"
                className="h-11 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
              />
            </div>
          </div>

          {/* Right Column - Organization & Credits */}
          <div className="space-y-6">
            
            {/* Category selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-neutral-700">Category</Label>
              <Select 
                value={formData.category || undefined} 
                onValueChange={(val: GalleryCategory) => setFormData(p => ({ ...p, category: val }))}
              >
                <SelectTrigger className="h-11 bg-white border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white border border-neutral-200 text-neutral-900 rounded-lg shadow-xl">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug} className="focus:bg-neutral-100 hover:bg-neutral-100 cursor-pointer">{cat.name_en} ({cat.name_bn})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exhibition Association */}
            <div className="space-y-3 p-4 rounded-2xl border border-neutral-200 bg-neutral-50/30">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Exhibition Link</Label>
              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setExhibitionAssociation('associate')}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                >
                  <AdminSettingTile
                    icon={<Globe className={`h-5 w-5 ${exhibitionAssociation === 'associate' ? 'text-blue-600' : 'text-neutral-400'}`} />}
                    title="Associate with Exhibition"
                    description="Link this media to a specific exhibition gallery."
                    active={exhibitionAssociation === 'associate'}
                    className={cn(
                      "transition-all duration-300",
                      exhibitionAssociation === 'associate' 
                        ? "border-blue-200 bg-blue-50/50 shadow-sm" 
                        : "border-neutral-200 bg-white hover:bg-neutral-50/80 hover:border-neutral-300"
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExhibitionAssociation('independent')
                    setFormData(p => ({ ...p, exhibition_id: null as any }))
                  }}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                >
                  <AdminSettingTile
                    icon={<Star className={`h-5 w-5 ${exhibitionAssociation === 'independent' ? 'text-amber-500' : 'text-neutral-400'}`} />}
                    title="Independent Media"
                    description="Stand-alone media not tied to any exhibition."
                    active={exhibitionAssociation === 'independent'}
                    className={cn(
                      "transition-all duration-300",
                      exhibitionAssociation === 'independent' 
                        ? "border-amber-200 bg-amber-50/50 shadow-sm" 
                        : "border-neutral-200 bg-white hover:bg-neutral-50/80 hover:border-neutral-300"
                    )}
                  />
                </button>
              </div>

              {exhibitionAssociation === "associate" && (
                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <Label className="text-sm font-semibold text-neutral-700 mb-2 block">Select Exhibition</Label>
                  <Select 
                    value={formData.exhibition_id || 'none'} 
                    onValueChange={val => setFormData(p => ({ ...p, exhibition_id: val }))}
                  >
                    <SelectTrigger className="h-11 bg-white border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <SelectValue placeholder="Select exhibition..." />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] bg-white border border-neutral-200 text-neutral-900 shadow-xl rounded-lg max-h-[300px]">
                      <SelectItem value="none" disabled className="text-neutral-400">Select exhibition...</SelectItem>
                      {ongoingEx.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Ongoing</SelectLabel>
                          {ongoingEx.map(e => (
                            <SelectItem key={e.id} value={e.id} className="focus:bg-neutral-100 cursor-pointer">{e.year} · {e.theme_en}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {upcomingEx.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-blue-600 font-bold text-xs uppercase tracking-wider mt-2">Upcoming</SelectLabel>
                          {upcomingEx.map(e => (
                            <SelectItem key={e.id} value={e.id} className="focus:bg-neutral-100 cursor-pointer">{e.year} · {e.theme_en}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {archivedEx.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-neutral-500 font-bold text-xs uppercase tracking-wider mt-2">Archived</SelectLabel>
                          {archivedEx.map(e => (
                            <SelectItem key={e.id} value={e.id} className="focus:bg-neutral-100 cursor-pointer">{e.year} · {e.theme_en}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {draftEx.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-amber-600 font-bold text-xs uppercase tracking-wider mt-2">Draft</SelectLabel>
                          {draftEx.map(e => (
                            <SelectItem key={e.id} value={e.id} className="focus:bg-neutral-100 cursor-pointer">{e.year} · {e.theme_en} (Draft)</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Visibility Settings */}
            <div className="space-y-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Visibility</Label>
              <RadioGroup
                value={formData.visibility || 'public'}
                onValueChange={(val: 'public' | 'hidden') => setFormData(p => ({ ...p, visibility: val }))}
                className="grid grid-cols-2 gap-4 mt-2"
              >
                <Label 
                  htmlFor="edit_v_public"
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.visibility === 'public' || !formData.visibility
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <RadioGroupItem value="public" id="edit_v_public" className="border-neutral-300 text-blue-600 focus-visible:ring-blue-500" />
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <Eye className="w-4 h-4 text-neutral-500" /> Public
                  </div>
                </Label>
                <Label 
                  htmlFor="edit_v_hidden"
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.visibility === 'hidden'
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <RadioGroupItem value="hidden" id="edit_v_hidden" className="border-neutral-300 text-blue-600 focus-visible:ring-blue-500" />
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <EyeOff className="w-4 h-4 text-neutral-500" /> Hidden
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Credits (Photographer, Videographer, Copyright) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_photographer" className="text-sm font-semibold text-neutral-700">Photographer</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input 
                    id="edit_photographer"
                    value={formData.photographer || ''} 
                    onChange={e => setFormData(p => ({ ...p, photographer: e.target.value }))}
                    placeholder="Name"
                    className="h-11 pl-9 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_videographer" className="text-sm font-semibold text-neutral-700">Videographer</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input 
                    id="edit_videographer"
                    value={formData.videographer || ''} 
                    onChange={e => setFormData(p => ({ ...p, videographer: e.target.value }))}
                    placeholder="Name"
                    className="h-11 pl-9 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit_copyright" className="text-sm font-semibold text-neutral-700">Copyright License</Label>
                <Input 
                  id="edit_copyright"
                  value={formData.copyright || ''} 
                  onChange={e => setFormData(p => ({ ...p, copyright: e.target.value }))}
                  placeholder="e.g. © 2026 Rongdhono"
                  className="h-11 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
                />
              </div>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="edit_sort_order" className="text-sm font-semibold text-neutral-700">Display Sort Order</Label>
              <Input 
                id="edit_sort_order"
                type="number"
                value={formData.sort_order || 0} 
                onChange={e => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                className="h-11 bg-neutral-50 border-neutral-200 text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-lg"
              />
            </div>

            <AdminSettingTile
              icon={
                <Star
                  className={`h-4 w-4 ${formData.is_featured ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`}
                />
              }
              title="Featured Media"
              description="Highlight and pin this asset to the gallery homepage."
              active={formData.is_featured || false}
              className="border-neutral-200 bg-white shadow-sm"
            >
              <PremiumSwitch
                id="edit_featured"
                checked={formData.is_featured || false}
                onCheckedChange={val => setFormData(p => ({ ...p, is_featured: val }))}
                aria-label="Feature this media on the gallery homepage"
              />
            </AdminSettingTile>

          </div>
        </div>

        <DialogFooter className="mt-2 border-t border-neutral-200 pt-6 flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving} className="rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-medium px-6 h-11">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.title_en?.trim()} className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-6 h-11 font-semibold shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
