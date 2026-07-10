'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { createGalleryMedia } from "@/actions/gallery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PremiumSwitch } from "@/components/admin/ui/PremiumSwitch"
import { AdminSettingTile } from "@/components/admin/ui/AdminSettingTile"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Loader2, Upload, X, Sparkles, Film, Image as ImageIcon,
  CheckCircle2, Info, User, HelpCircle, Eye, EyeOff, Star, ArrowRight,
  Globe, Lock
} from "lucide-react"
import Image from "next/image"
import type { Database } from "@/types/database"

type CategoryRow = Database["public"]["Tables"]["gallery_categories"]["Row"]
type ExhibitionRow = Pick<Database["public"]["Tables"]["exhibitions"]["Row"], "id" | "theme_en" | "theme_bn" | "year" | "status">

interface CustomGalleryUploaderProps {
  locale: string
  categories: CategoryRow[]
  exhibitions: ExhibitionRow[]
  independentAlbums: { id: string; title: string; title_en: string; title_bn: string | null; category_slug: string | null }[]
}

interface FormData {
  title_en: string
  title_bn: string
  description_en: string
  description_bn: string
  alt_text: string
  photographer: string
  videographer: string
  copyright: string
  category: string
  exhibition_association: "associate" | "independent"
  exhibition_id: string
  gallery_album_id: string
  new_album_title: string
  visibility: "public" | "hidden"
  is_featured: boolean
}

function SectionBadge({ number, label, icon }: { number: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-bold shrink-0">
        {number}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h2 className="font-serif text-lg font-semibold">{label}</h2>
      </div>
    </div>
  )
}

function Field({
  label, required, children, hint,
}: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function CustomGalleryUploader({ locale, categories, exhibitions, independentAlbums }: CustomGalleryUploaderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mediaFile, setMediaFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>("")
  const [mediaType, setMediaType] = React.useState<"image" | "video" | null>(null)
  const [videoDuration, setVideoDuration] = React.useState<string>("")
  const [imageResolution, setImageResolution] = React.useState<string>("")
  const [isDragging, setIsDragging] = React.useState(false)

  const [formData, setFormData] = React.useState<FormData>({
    title_en: "",
    title_bn: "",
    description_en: "",
    description_bn: "",
    alt_text: "",
    photographer: "",
    videographer: "",
    copyright: "",
    category: categories[0]?.slug || "",
    exhibition_association: "independent",
    exhibition_id: "none",
    gallery_album_id: "none",
    new_album_title: "",
    visibility: "public",
    is_featured: false
  })

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  React.useEffect(() => {
    updateField("gallery_album_id", "none")
    updateField("new_album_title", "")
  }, [formData.category])

  const handleMediaFile = (file: File) => {
    const isImg = file.type.startsWith("image/")
    const isVid = file.type.startsWith("video/")

    if (!isImg && !isVid) {
      toast.error("Invalid file format", { description: "Please upload an image or video file." })
      return
    }

    // Size check
    if (isImg && file.size > 20 * 1024 * 1024) {
      toast.error("Image file too large", { description: "Maximum allowed size is 20 MB." })
      return
    }

    if (isVid && file.size > 500 * 1024 * 1024) {
      toast.error("Video file too large", { description: "Maximum allowed size is 500 MB." })
      return
    }

    // Revoke previous url if any
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setMediaFile(file)
    const newUrl = URL.createObjectURL(file)
    setPreviewUrl(newUrl)
    setMediaType(isImg ? "image" : "video")
    setVideoDuration("")
    setImageResolution("")

    // Extra metadata extraction
    if (isImg) {
      const img = new window.Image()
      img.onload = () => {
        setImageResolution(`${img.width} × ${img.height} px`)
      }
      img.src = newUrl
    } else if (isVid) {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        const mins = Math.floor(video.duration / 60)
        const secs = Math.floor(video.duration % 60)
        setVideoDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
        setImageResolution(`${video.videoWidth} × ${video.videoHeight} px`)
      }
      video.src = newUrl
    }
  }

  // Handle Paste
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files?.[0]
      if (file) handleMediaFile(file)
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [previewUrl])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleMediaFile(file)
  }

  const handleClearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setMediaFile(null)
    setPreviewUrl("")
    setMediaType(null)
    setVideoDuration("")
    setImageResolution("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title_en.trim()) {
      toast.error("Title required", { description: "English Title is required." })
      return
    }

    if (!mediaFile) {
      toast.error("File required", { description: "Please upload an image or video." })
      return
    }

    if (formData.exhibition_association === "associate" && (!formData.exhibition_id || formData.exhibition_id === "none")) {
      toast.error("Exhibition selection required", { description: "Please select an exhibition or choose Independent Gallery Media." })
      return
    }

    if (formData.exhibition_association === "independent" && formData.gallery_album_id === "none" && !formData.new_album_title.trim()) {
      toast.error("Album selection required", { description: "Please select an independent album or enter a new album title." })
      return
    }

    try {
      setIsSubmitting(true)
      const payload = new FormData()
      payload.append("file", mediaFile)
      payload.append("title_en", formData.title_en)
      payload.append("title_bn", formData.title_bn)
      payload.append("description_en", formData.description_en)
      payload.append("description_bn", formData.description_bn)
      payload.append("alt_text", formData.alt_text)
      payload.append("photographer", formData.photographer)
      payload.append("videographer", formData.videographer)
      payload.append("copyright", formData.copyright)
      payload.append("category", formData.category)
      payload.append("visibility", formData.visibility)
      payload.append("is_featured", String(formData.is_featured))
      payload.append("exhibition_association", formData.exhibition_association)

      if (formData.exhibition_association === "associate") {
        payload.append("exhibition_id", formData.exhibition_id)
      } else {
        payload.append("exhibition_id", "none")
        payload.append("gallery_album_id", formData.gallery_album_id)
        payload.append("new_album_title", formData.new_album_title)
      }

      const res = await createGalleryMedia(payload)
      if (!res.success) throw new Error(res.error)

      toast.success("Media Uploaded Successfully", {
        description: "Your item is now registered in the gallery archive."
      })

      router.push(`/${locale}/admin/gallery`)
      router.refresh()
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message || "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter exhibitions by status
  const ongoingEx = exhibitions.filter(e => e.status === "ongoing")
  const upcomingEx = exhibitions.filter(e => e.status === "upcoming")
  const archivedEx = exhibitions.filter(e => e.status !== "ongoing" && e.status !== "upcoming" && e.status !== "draft")
  const draftEx = exhibitions.filter(e => e.status === "draft")

  const selectedExDetails = React.useMemo(() => {
    if (formData.exhibition_association === "independent" || formData.exhibition_id === "none") return null
    return exhibitions.find(e => e.id === formData.exhibition_id)
  }, [formData.exhibition_association, formData.exhibition_id, exhibitions])

  // Checklist computation
  const checklist = [
    { label: "Title", filled: !!formData.title_en.trim() },
    { label: "Category", filled: !!formData.category },
    { label: "File Selected", filled: !!mediaFile },
    { label: "Ready to Upload", filled: !!formData.title_en.trim() && !!formData.category && !!mediaFile }
  ]
  const completedChecklistCount = checklist.filter(c => c.filled).length

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form Settings */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Section 1: Details */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={1} label="Media Details" icon={<Sparkles className="w-4 h-4" />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Media Title — English" required hint="Display label for public gallery space.">
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={e => updateField("title_en", e.target.value)}
                    placeholder="e.g. Silva Gallery Opening Ceremony"
                    required
                    className="h-11"
                    autoFocus
                  />
                </Field>
                <Field label="মিডিয়া শিরোনাম — বাংলা" hint="Optional Bengali title.">
                  <Input
                    id="title_bn"
                    value={formData.title_bn}
                    onChange={e => updateField("title_bn", e.target.value)}
                    placeholder="যেমন: সিলভা গ্যালারি উদ্বোধনী অনুষ্ঠান"
                    className="h-11"
                    dir="auto"
                  />
                </Field>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Description — English</Label>
                  <Textarea
                    id="description_en"
                    rows={3}
                    value={formData.description_en}
                    onChange={e => updateField("description_en", e.target.value)}
                    placeholder="Contextual description of this media item..."
                    className="resize-none"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>বর্ণনা — বাংলা</Label>
                  <Textarea
                    id="description_bn"
                    rows={2}
                    value={formData.description_bn}
                    onChange={e => updateField("description_bn", e.target.value)}
                    placeholder="মিডিয়া সম্পর্কিত বিবরণ..."
                    className="resize-none"
                    dir="auto"
                  />
                </div>
                <Field label="Alt Text (Accessibility)" hint="Detailed image description for screen readers and search engines.">
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={e => updateField("alt_text", e.target.value)}
                    placeholder="e.g. Group of artists standing at the ceremony entrance holding flowers"
                    className="h-11"
                  />
                </Field>
                <Field label="Copyright Owner" hint="Copyright details or credit mapping.">
                  <Input
                    id="copyright"
                    value={formData.copyright}
                    onChange={e => updateField("copyright", e.target.value)}
                    placeholder="e.g. © 2026 Rongdhono Artists Collective"
                    className="h-11"
                  />
                </Field>
                <Field label="Photographer Credit">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="photographer"
                      value={formData.photographer}
                      onChange={e => updateField("photographer", e.target.value)}
                      placeholder="Photographer's name"
                      className="h-11 pl-9"
                    />
                  </div>
                </Field>
                <Field label="Videographer Credit">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="videographer"
                      value={formData.videographer}
                      onChange={e => updateField("videographer", e.target.value)}
                      placeholder="Videographer's name"
                      className="h-11 pl-9"
                    />
                  </div>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Category */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={2} label="Gallery Category" icon={<HelpCircle className="w-4 h-4" />} />
              <div className="max-w-md">
                <Field label="Media Category" required hint="Choose how this asset is indexed.">
                  <Select
                    value={formData.category}
                    onValueChange={val => updateField("category", val)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.slug}>{c.name_en} ({c.name_bn})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Exhibition Association */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-purple-500 via-purple-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={3} label="Exhibition Association" icon={<Globe className="w-4 h-4" />} />
              <div className="space-y-6">
                <RadioGroup
                  value={formData.exhibition_association}
                  onValueChange={val => {
                    updateField("exhibition_association", val)
                    if (val === "independent") updateField("exhibition_id", "none")
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="admin-option-tile flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4 transition-colors hover:bg-muted/20">
                    <RadioGroupItem value="associate" id="r_associate" className="mt-1" />
                    <label htmlFor="r_associate" className="flex w-full cursor-pointer flex-col space-y-1">
                      <span className="text-sm font-semibold">Associate with Exhibition</span>
                      <span className="text-xs text-muted-foreground">Map to a specific roster exhibition event.</span>
                    </label>
                  </div>
                  <div className="admin-option-tile flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4 transition-colors hover:bg-muted/20">
                    <RadioGroupItem value="independent" id="r_independent" className="mt-1" />
                    <label htmlFor="r_independent" className="flex w-full cursor-pointer flex-col space-y-1">
                      <span className="text-sm font-semibold">Independent Gallery Media</span>
                      <span className="text-xs text-muted-foreground">Store independently without linking to an exhibition.</span>
                    </label>
                  </div>
                </RadioGroup>

                {formData.exhibition_association === "associate" && (
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 max-w-xl animate-in fade-in-50 duration-200">
                    <Field label="Choose Exhibition" required hint="Select an exhibition from the ongoing, upcoming or archived catalog.">
                      <Select
                        value={formData.exhibition_id}
                        onValueChange={val => updateField("exhibition_id", val)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select exhibition..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none" disabled>Select exhibition...</SelectItem>
                          {ongoingEx.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider">Ongoing Exhibitions</SelectLabel>
                              {ongoingEx.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {upcomingEx.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="text-blue-400 font-mono text-[10px] uppercase tracking-wider">Upcoming Exhibitions</SelectLabel>
                              {upcomingEx.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {archivedEx.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">Archived Exhibitions</SelectLabel>
                              {archivedEx.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                          {draftEx.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="text-amber-500 font-mono text-[10px] uppercase tracking-wider">Draft Exhibitions</SelectLabel>
                              {draftEx.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.year} · {e.theme_en} (Draft)</SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                )}

                {formData.exhibition_association === "independent" && (
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 max-w-xl space-y-4 animate-in fade-in-50 duration-200">
                    <Field label="Choose Independent Album" required hint="Select an existing independent album or create a new one.">
                      <Select
                        value={formData.gallery_album_id}
                        onValueChange={val => {
                          updateField("gallery_album_id", val)
                          if (val !== "new") updateField("new_album_title", "")
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select album..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none" disabled>Select album...</SelectItem>
                          <SelectItem value="new" className="font-bold text-accent">+ Create New Independent Album</SelectItem>
                          {independentAlbums
                            .filter(a => a.category_slug === formData.category)
                            .map(a => (
                              <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    {formData.gallery_album_id === "new" && (
                      <Field label="New Album Title (English)" required hint="Unique title for the new independent album.">
                        <Input
                          id="new_album_title"
                          value={formData.new_album_title}
                          onChange={e => updateField("new_album_title", e.target.value)}
                          placeholder="e.g. Workshop 2026"
                          className="h-11"
                          required
                        />
                      </Field>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4 & 5: File Upload */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={4} label="File Upload" icon={<Upload className="w-4 h-4" />} />
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  isDragging
                    ? "border-accent bg-accent/10 scale-[1.01]"
                    : "border-border hover:border-accent/50 hover:bg-accent/5"
                } ${previewUrl ? "p-0 overflow-hidden" : "p-8 md:p-12"}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="relative w-full aspect-[16/9] bg-black">
                    {mediaType === "image" ? (
                      <Image
                        src={previewUrl}
                        alt="Media Preview"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 text-white flex items-end justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-white/90 truncate max-w-sm">{mediaFile?.name}</p>
                        <p className="text-[10px] text-white/60 font-mono">
                          {mediaFile ? (mediaFile.size / 1024 / 1024).toFixed(2) : 0} MB · {mediaFile?.type}
                          {imageResolution ? ` · ${imageResolution}` : ""}
                          {videoDuration ? ` · Length: ${videoDuration}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl border border-dashed border-accent/40 bg-accent/5 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                      <Upload className="w-7 h-7 text-accent" />
                    </div>
                    <p className="font-semibold text-base mb-1">Drag & drop, click, or paste to upload</p>
                    <p className="text-xs text-muted-foreground">
                      Images (Max 20MB): JPG, PNG, WEBP, AVIF
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Videos (Max 500MB): MP4, MOV, WEBM
                    </p>
                    <input
                      id="custom_media_input"
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleMediaFile(e.target.files[0]) }}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Display Settings */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={5} label="Display Settings" icon={<Eye className="w-4 h-4" />} />
              <div className="space-y-6">
                
                {/* Visibility Selector */}
                <div className="flex flex-col gap-3">
                  <Label className="text-sm font-semibold">Visibility Settings</Label>
                  <RadioGroup
                    value={formData.visibility}
                    onValueChange={val => updateField("visibility", val)}
                    className="space-y-4"
                  >
                    <AdminSettingTile
                      icon={
                        <Eye className={`h-4 w-4 ${formData.visibility === 'public' ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      }
                      title="Public"
                      description="Instantly index into the public gallery grid archive."
                      active={formData.visibility === 'public'}
                    >
                      <RadioGroupItem value="public" id="v_public" aria-label="Public visibility" />
                    </AdminSettingTile>

                    <AdminSettingTile
                      icon={
                        <EyeOff className={`h-4 w-4 ${formData.visibility === 'hidden' ? 'text-rose-400' : 'text-muted-foreground'}`} />
                      }
                      title="Hidden / Admin Only"
                      description="Store safely in the database backend. Access only via admin panels."
                      active={formData.visibility === 'hidden'}
                    >
                      <RadioGroupItem value="hidden" id="v_hidden" aria-label="Hidden admin-only visibility" />
                    </AdminSettingTile>
                  </RadioGroup>
                </div>

                <AdminSettingTile
                  icon={
                    <Star
                      className={`h-4 w-4 ${
                        formData.is_featured ? 'fill-amber-400/30 text-amber-400' : 'text-muted-foreground'
                      }`}
                    />
                  }
                  title="Pin to Gallery Showcase"
                  description="Highlight this media as a featured artifact."
                  active={formData.is_featured}
                >
                  <PremiumSwitch
                    id="is_featured_switch"
                    checked={formData.is_featured}
                    onCheckedChange={checked => updateField("is_featured", checked)}
                    aria-label="Pin this media file to the featured showcase"
                  />
                </AdminSettingTile>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Live Preview & Checklist */}
        <div className="xl:sticky xl:top-24 space-y-6">
          
          {/* Live Preview Panel */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-accent to-transparent" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                Live Preview
              </CardTitle>
              <CardDescription className="text-xs">How this item renders in the gallery grid.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
                {previewUrl ? (
                  mediaType === "image" ? (
                    <Image src={previewUrl} alt="preview" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <video src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <Film className="w-10 h-10 text-white/60 relative z-10" />
                    </div>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  {formData.visibility === "hidden" && (
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm bg-rose-500 text-white flex items-center gap-1">
                      <EyeOff className="w-2.5 h-2.5" /> Hidden
                    </span>
                  )}
                  {formData.is_featured && (
                    <span className="p-1 rounded bg-amber-500 text-black shadow-sm">
                      <Star className="w-3 h-3 fill-black" />
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 flex flex-col justify-end">
                  <p className="font-serif text-white text-base font-bold line-clamp-1 mb-1">
                    {formData.title_en || "Media Title"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[8px] font-medium tracking-wider uppercase bg-white/20 px-1.5 py-0.5 rounded text-white border border-white/10">
                      {categories.find(c => c.slug === formData.category)?.name_en || "Category"}
                    </span>
                    {selectedExDetails && (
                      <span className="text-accent text-[8px] font-mono uppercase tracking-widest bg-black/50 px-1.5 py-0.5 rounded border border-white/10 truncate max-w-[120px]">
                        {selectedExDetails.theme_en}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Checklist */}
          <Card className="border border-border/60">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Upload Checklist
                <span className="ml-auto text-xs font-normal text-muted-foreground">{completedChecklistCount}/4</span>
              </p>
              {checklist.map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    c.filled
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "border-border/60 text-transparent"
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span className={`text-sm ${c.filled ? "text-foreground" : "text-muted-foreground"}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Panel */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !formData.title_en.trim() || !mediaFile || (formData.exhibition_association === "associate" && formData.exhibition_id === "none")}
              className="relative w-full h-12 rounded-xl font-semibold text-sm overflow-hidden transition-all
                bg-accent text-accent-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]
                disabled:pointer-events-none disabled:opacity-50
                shadow-lg shadow-accent/20"
            >
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & Processing…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Start Custom Upload <ArrowRight className="w-4 h-4" /></>
                )}
              </span>
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            Uploaded assets are committed directly to the gallery archive and storage bucket. Duplicate file names will resolve automatically.
          </p>

        </div>
      </div>
    </form>
  )
}
