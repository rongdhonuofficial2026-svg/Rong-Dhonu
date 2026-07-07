'use client'

import * as React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Check, Clock, AlertTriangle, XCircle, ImageIcon,
  Edit2, RefreshCw, Loader2, ExternalLink
} from "lucide-react"
import { resubmitArtwork } from "@/actions/admin/artworks"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface ArtworkCardProps {
  artwork: {
    id: string
    title_en: string
    title_bn?: string | null
    description_en?: string | null
    description_bn?: string | null
    main_image_url?: string | null
    status: string
    created_at: string
    category?: string | null
    medium_en?: string | null
    medium_bn?: string | null
    dimensions?: string | null
    price?: number | null
    moderator_feedback?: string | null
    notes?: string | null
    approved_at?: string | null
    exhibition_id?: string | null
    exhibitions?: { id: string; theme_en: string; theme_bn?: string | null; year: number } | Array<{ id: string; theme_en: string; theme_bn?: string | null; year: number }> | null
  }
  locale: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    labelBn: 'পর্যালোচনার অপেক্ষায়',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    icon: Clock,
    description: 'Your artwork has been submitted and is awaiting moderator review.',
  },
  approved: {
    label: 'Approved',
    labelBn: 'অনুমোদিত',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: Check,
    description: 'Your artwork has been approved for the exhibition.',
  },
  changes_requested: {
    label: 'Revision Requested',
    labelBn: 'সংশোধন প্রয়োজন',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: AlertTriangle,
    description: 'The moderator has requested changes to your submission.',
  },
  rejected: {
    label: 'Not Selected',
    labelBn: 'নির্বাচিত হয়নি',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: XCircle,
    description: 'Your artwork was not selected for this exhibition.',
  },
}

const CATEGORIES = [
  "Painting", "Watercolor", "Acrylic", "Oil", "Sculpture",
  "Digital Art", "Photography", "Mixed Media", "Drawing", "Printmaking",
  "Textile", "Calligraphy", "Other"
]

export function ArtworkCard({ artwork, locale }: ArtworkCardProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(artwork.main_image_url || null)

  const [editData, setEditData] = React.useState({
    title_en:       artwork.title_en ?? '',
    title_bn:       artwork.title_bn ?? '',
    medium_en:      artwork.medium_en ?? '',
    medium_bn:      artwork.medium_bn ?? '',
    dimensions:     artwork.dimensions ?? '',
    category:       artwork.category ?? '',
    price:          artwork.price ? String(artwork.price) : '',
    description_en: artwork.description_en ?? '',
    description_bn: artwork.description_bn ?? '',
    main_image_url: artwork.main_image_url ?? '',
    revision_notes: '',
  })

  // Get user ID for image uploads
  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
  }, [])

  const statusConfig = STATUS_CONFIG[artwork.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const title = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
  const feedback = artwork.moderator_feedback || artwork.notes

  const exhibition = Array.isArray(artwork.exhibitions)
    ? artwork.exhibitions[0]
    : artwork.exhibitions

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File Too Large", { description: "Please upload an image under 10MB." })
        return
      }
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!userId) throw new Error("Not signed in — please refresh and try again.")
    const supabase = createClient()
    setUploadProgress(20)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('artworks_optimized')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`)
    }

    setUploadProgress(90)
    const { data: { publicUrl } } = supabase.storage.from('artworks_optimized').getPublicUrl(fileName)
    setUploadProgress(100)
    return publicUrl
  }

  const handleResubmit = async () => {
    if (!editData.title_en.trim()) {
      toast.error("Title Required", { description: "Please enter the artwork title in English." })
      return
    }
    if (!editData.medium_en.trim()) {
      toast.error("Medium Required", { description: "Please enter the medium in English." })
      return
    }
    if (!editData.dimensions.trim()) {
      toast.error("Dimensions Required", { description: "Please enter the dimensions." })
      return
    }
    if (!editData.revision_notes.trim()) {
      toast.error("Revision Notes Required", { description: "Describe what you changed so moderators can review." })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)
    try {
      let finalImageUrl = editData.main_image_url

      if (imageFile) {
        toast.loading("Uploading new image...", { id: "upload-toast" })
        finalImageUrl = await uploadImageToSupabase(imageFile)
        toast.dismiss("upload-toast")
      }

      const res = await resubmitArtwork(artwork.id, {
        title_en:       editData.title_en || undefined,
        title_bn:       editData.title_bn || undefined,
        medium_en:      editData.medium_en || undefined,
        medium_bn:      editData.medium_bn || undefined,
        dimensions:     editData.dimensions || undefined,
        category:       editData.category || undefined,
        price:          editData.price ? Number(editData.price) : null,
        description_en: editData.description_en || undefined,
        description_bn: editData.description_bn || undefined,
        main_image_url: finalImageUrl || undefined,
        revision_notes: editData.revision_notes || undefined,
      })

      if (res.error) {
        toast.error('Resubmission Failed', { description: res.error })
      } else {
        toast.success('Revision Submitted!', {
          description: 'Your updated artwork has been sent back for moderator review.',
        })
        setIsEditOpen(false)
        setImageFile(null)
      }
    } catch (err: unknown) {
      toast.dismiss("upload-toast")
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      toast.error("Resubmission Failed", { description: message })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <>
      <Card className="overflow-hidden flex flex-col group">
        {/* Artwork Thumbnail */}
        <div className="relative aspect-[4/3] bg-muted w-full border-b border-border">
          {artwork.main_image_url ? (
            <Image
              src={artwork.main_image_url}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageIcon className="w-10 h-10 opacity-50" />
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="outline" className={`capitalize shadow-sm backdrop-blur-md bg-background/80 flex items-center gap-1.5 ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {locale === 'bn' ? statusConfig.labelBn : statusConfig.label}
            </Badge>
          </div>

          {/* Category Badge */}
          {artwork.category && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="secondary" className="text-xs shadow-sm backdrop-blur-md bg-background/80">
                {artwork.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold line-clamp-1">{title}</h3>
            {exhibition && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {exhibition.year} — {locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-0.5 flex-1">
            {artwork.medium_en && <p><span className="font-medium">Medium:</span> {artwork.medium_en}</p>}
            {artwork.dimensions && <p><span className="font-medium">Dimensions:</span> {artwork.dimensions}</p>}
            <p>Submitted: {new Date(artwork.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            {artwork.approved_at && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                Approved: {new Date(artwork.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Moderator Feedback (shown for revision and rejection) */}
          {feedback && (artwork.status === 'changes_requested' || artwork.status === 'rejected') && (
            <div className={`p-3 rounded-lg border text-sm ${
              artwork.status === 'changes_requested'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
            }`}>
              <p className="font-semibold text-xs uppercase tracking-wide mb-1">
                {artwork.status === 'changes_requested' ? '📝 Moderator Feedback' : '❌ Reason'}
              </p>
              <p className="leading-relaxed">{feedback}</p>
            </div>
          )}

          {/* Approved: Show link to public view */}
          {artwork.status === 'approved' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm">
              <Check className="w-4 h-4 shrink-0" />
              <span className="flex-1">Selected for exhibition</span>
              {artwork.exhibition_id && (
                <a
                  href={`/${locale}/exhibitions/${artwork.exhibition_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:underline"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          {artwork.status === 'changes_requested' && (
            <div className="pt-3 border-t border-border mt-auto">
              <Button
                onClick={() => {
                  setEditData({
                    title_en:       artwork.title_en ?? '',
                    title_bn:       artwork.title_bn ?? '',
                    medium_en:      artwork.medium_en ?? '',
                    medium_bn:      artwork.medium_bn ?? '',
                    dimensions:     artwork.dimensions ?? '',
                    category:       artwork.category ?? '',
                    price:          artwork.price ? String(artwork.price) : '',
                    description_en: artwork.description_en ?? '',
                    description_bn: artwork.description_bn ?? '',
                    main_image_url: artwork.main_image_url ?? '',
                    revision_notes: '',
                  })
                  setImagePreviewUrl(artwork.main_image_url || null)
                  setImageFile(null)
                  setIsEditOpen(true)
                }}
                className="w-full gap-2"
                size="sm"
              >
                <Edit2 className="w-4 h-4" />
                {locale === 'bn' ? 'সংশোধন করুন ও পুনরায় জমা দিন' : 'Edit & Submit Revision'}
              </Button>
            </div>
          )}

          {artwork.status === 'rejected' && (
            <div className="pt-3 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground text-center">
                {locale === 'bn'
                  ? 'নতুন শিল্পকর্ম জমা দিন।'
                  : 'You may submit a new artwork for the next exhibition.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Revision Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 text-zinc-50 border-zinc-800 rounded-2xl flex flex-col p-6 shadow-2xl">
          <DialogTitle className="font-serif text-2xl font-bold tracking-tight">
            {locale === 'bn' ? 'সংশোধিত শিল্পকর্ম জমা দিন' : 'Submit Revised Artwork'}
          </DialogTitle>
          <p className="text-sm text-zinc-400 -mt-2">
            {locale === 'bn' 
              ? 'মডারেটরের প্রতিক্রিয়া অনুযায়ী আপনার শিল্পকর্মের বিবরণ আপডেট করুন।' 
              : 'Please update your artwork according to the moderator\'s feedback.'}
          </p>

          {/* Show the feedback prominently */}
          {feedback && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  {locale === 'bn' ? 'মডারেটর প্রতিক্রিয়া' : 'Moderator Feedback'}
                </p>
                <p className="text-sm text-amber-200/80 leading-relaxed font-mono">{feedback}</p>
              </div>
            </div>
          )}

          <div className="space-y-6 pt-2">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 border-b border-zinc-800 pb-2">
              {locale === 'bn' ? 'শিল্পকর্মের বিবরণ' : 'Artwork Details'}
            </h4>

            {/* Title fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="revision-title-en" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'শিরোনাম (ইংরেজি) *' : 'Title (English) *'}
                </Label>
                <Input
                  id="revision-title-en"
                  value={editData.title_en}
                  onChange={e => setEditData(d => ({ ...d, title_en: e.target.value }))}
                  placeholder="English title"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revision-title-bn" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'}
                </Label>
                <Input
                  id="revision-title-bn"
                  value={editData.title_bn}
                  onChange={e => setEditData(d => ({ ...d, title_bn: e.target.value }))}
                  placeholder="বাংলা শিরোনাম"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 text-sm rounded-lg"
                />
              </div>
            </div>

            {/* Medium fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="revision-medium-en" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'মাধ্যম (ইংরেজি) *' : 'Medium (English) *'}
                </Label>
                <Input
                  id="revision-medium-en"
                  value={editData.medium_en}
                  onChange={e => setEditData(d => ({ ...d, medium_en: e.target.value }))}
                  placeholder="e.g. Oil on canvas"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revision-medium-bn" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'মাধ্যম (বাংলা)' : 'Medium (Bengali)'}
                </Label>
                <Input
                  id="revision-medium-bn"
                  value={editData.medium_bn}
                  onChange={e => setEditData(d => ({ ...d, medium_bn: e.target.value }))}
                  placeholder="যেমন: ক্যানভাসে তেলরঙ"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 text-sm rounded-lg"
                />
              </div>
            </div>

            {/* Dimensions, Category, Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="revision-dimensions" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'পরিমাপ *' : 'Dimensions *'}
                </Label>
                <Input
                  id="revision-dimensions"
                  value={editData.dimensions}
                  onChange={e => setEditData(d => ({ ...d, dimensions: e.target.value }))}
                  placeholder="e.g. 24 x 36 inches"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 text-sm rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revision-category" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'বিভাগ' : 'Category'}
                </Label>
                <Select
                  value={editData.category}
                  onValueChange={val => setEditData(d => ({ ...d, category: val }))}
                >
                  <SelectTrigger id="revision-category" className="bg-zinc-900/50 border-zinc-800 text-sm rounded-lg">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revision-price" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'মূল্য (ঐচ্ছিক)' : 'Price (optional)'}
                </Label>
                <Input
                  id="revision-price"
                  type="number"
                  value={editData.price}
                  onChange={e => setEditData(d => ({ ...d, price: e.target.value }))}
                  placeholder="e.g. 15000"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 text-sm rounded-lg"
                />
              </div>
            </div>

            {/* Artist Statement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="revision-desc-en" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'শিল্পীর বক্তব্য (ইংরেজি)' : 'Artist Statement (English)'}
                </Label>
                <Textarea
                  id="revision-desc-en"
                  value={editData.description_en}
                  onChange={e => setEditData(d => ({ ...d, description_en: e.target.value }))}
                  placeholder="Artist statement in English..."
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-sm rounded-lg h-24 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revision-desc-bn" className="text-xs font-medium text-zinc-400">
                  {locale === 'bn' ? 'শিল্পীর বক্তব্য (বাংলা)' : 'Artist Statement (Bengali)'}
                </Label>
                <Textarea
                  id="revision-desc-bn"
                  value={editData.description_bn}
                  onChange={e => setEditData(d => ({ ...d, description_bn: e.target.value }))}
                  placeholder="বাংলায় শিল্পীর বক্তব্য..."
                  className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-sm rounded-lg h-24 resize-none"
                />
              </div>
            </div>

            {/* Upload New Image */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-400">
                {locale === 'bn' ? 'নতুন ছবি আপলোড (ঐচ্ছিক)' : 'Upload New Image (optional)'}
              </Label>
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
                {/* Image Preview */}
                <div className="relative w-28 h-28 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreviewUrl ? (
                    <Image src={imagePreviewUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1 w-full text-center sm:text-left space-y-2">
                  <p className="text-xs text-zinc-400">
                    {locale === 'bn' 
                      ? 'নতুন ফাইল নির্বাচন করতে ক্লিক করুন (সর্বোচ্চ ১০ মেগাবাইট)' 
                      : 'Choose a new file to upload (maximum size 10MB)'}
                  </p>
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      id="revision-image-file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageSelect}
                    />
                    <Button type="button" variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
                      Choose Image
                    </Button>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mt-2">
                      <div className="bg-accent h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800 my-4" />

            {/* Revision Notes */}
            <div className="space-y-1.5 p-4 rounded-xl border border-zinc-800 bg-zinc-900/10">
              <Label htmlFor="revision-notes" className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <span>{locale === 'bn' ? 'সংশোধনীর মন্তব্য *' : 'Revision Notes *'}</span>
              </Label>
              <p className="text-xs text-zinc-500 mb-2">
                {locale === 'bn' ? 'মডারেটরদের জন্য আপনি কী পরিবর্তন করেছেন তা বর্ণনা করুন।' : 'Describe what you changed for the review committee.'}
              </p>
              <Textarea
                id="revision-notes"
                value={editData.revision_notes}
                onChange={e => setEditData(d => ({ ...d, revision_notes: e.target.value }))}
                placeholder={locale === 'bn' ? 'যেমন: মুখের অংশের আলোর গভীরতা বাড়ানো হয়েছে...' : 'Describe what you changed...'}
                className="bg-zinc-950 border-zinc-800 focus:border-zinc-700 text-sm rounded-lg h-20 resize-none placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 border-zinc-800 hover:bg-zinc-900" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium" onClick={handleResubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Submit Revision
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
