'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { createExhibition } from "@/actions/admin/exhibitions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Loader2, Upload, X, Sparkles, Calendar, MapPin, FileText,
  Image as ImageIcon, ArrowRight, CheckCircle2, Info,
} from "lucide-react"
import Image from "next/image"

/* ─── Types ─────────────────────────────────────────────── */
interface FormData {
  theme_en: string
  theme_bn: string
  description_en: string
  description_bn: string
  exhibition_start: string
  exhibition_end: string
  registration_start: string
  submission_end: string
  venue_en: string
  venue_bn: string
}

/* ─── Section badge ──────────────────────────────────────── */
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

/* ─── Field component ────────────────────────────────────── */
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

/* ─── Main Component ─────────────────────────────────────── */
export function ExhibitionForm({ locale }: { locale: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [heroImageFile, setHeroImageFile] = React.useState<File | null>(null)
  const [heroPreviewUrl, setHeroPreviewUrl] = React.useState<string>("")
  const [isDragging, setIsDragging] = React.useState(false)

  const [formData, setFormData] = React.useState<FormData>({
    theme_en: "",
    theme_bn: "",
    description_en: "",
    description_bn: "",
    exhibition_start: "",
    exhibition_end: "",
    registration_start: "",
    submission_end: "",
    venue_en: "",
    venue_bn: "",
  })

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  /* ── Image helpers ──────────────────────────────────── */
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", { description: "Please select an image file." })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum allowed size is 10 MB." })
      return
    }
    setHeroImageFile(file)
    setHeroPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }

  /* ── Submit ─────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.theme_en.trim()) {
      toast.error("Title required", { description: "Exhibition title (English) is required." })
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Upload hero banner if selected
      let hero_image_url: string | null = null
      if (heroImageFile) {
        const fileExt = heroImageFile.name.split(".").pop()
        const filePath = `exhibitions/hero-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(filePath, heroImageFile, { upsert: false })
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(filePath)
        hero_image_url = publicUrl
      }

      // 2. Create exhibition record
      const payload = {
        ...formData,
        status: "draft",
        hero_image_url,
        is_featured: false,
      }

      const res = await createExhibition(payload)
      if (res.error) throw new Error(res.error)

      toast.success("Exhibition Initialised", {
        description: "Redirecting to your new exhibition dashboard…",
        icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
      })

      router.push(`/${locale}/admin/exhibitions/${res.data.id}`)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error("Creation failed", { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Derived state for preview ───────────────────────── */
  const startYear = formData.exhibition_start
    ? new Date(formData.exhibition_start).getFullYear()
    : new Date().getFullYear()

  const formattedDateRange = (() => {
    if (!formData.exhibition_start && !formData.exhibition_end) return "Dates TBD"
    const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "?"
    return `${fmt(formData.exhibition_start)} — ${fmt(formData.exhibition_end)}`
  })()

  /* ── Progress indicator ──────────────────────────────── */
  const sections = [
    { label: "Title & Description", filled: !!formData.theme_en },
    { label: "Date Timeline", filled: !!formData.exhibition_start },
    { label: "Hero Banner", filled: !!heroImageFile },
    { label: "Venue", filled: !!formData.venue_en },
  ]
  const completedCount = sections.filter(s => s.filled).length

  /* ─────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

        {/* ── Left: Form Sections ──────────────────────── */}
        <div className="xl:col-span-2 space-y-8">

          {/* Section 1: Identity */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={1} label="Exhibition Identity" icon={<Sparkles className="w-4 h-4" />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Theme — English" required hint="The public display name of this exhibition.">
                  <Input
                    id="theme_en"
                    value={formData.theme_en}
                    onChange={e => updateField("theme_en", e.target.value)}
                    placeholder="e.g. Annual Summer Showcase 2026"
                    required
                    className="h-11"
                    autoFocus
                  />
                </Field>
                <Field label="বিষয় — বাংলা" hint="Optional Bengali title.">
                  <Input
                    id="theme_bn"
                    value={formData.theme_bn}
                    onChange={e => updateField("theme_bn", e.target.value)}
                    placeholder="যেমন: বার্ষিক গ্রীষ্মকালীন প্রদর্শনী ২০২৬"
                    className="h-11"
                    dir="auto"
                  />
                </Field>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Curatorial Statement — English</label>
                  <Textarea
                    id="description_en"
                    rows={4}
                    value={formData.description_en}
                    onChange={e => updateField("description_en", e.target.value)}
                    placeholder="Describe the artistic vision, themes, and goals of this exhibition…"
                    className="resize-none"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">কিউরেটোরিয়াল বিবৃতি — বাংলা</label>
                  <Textarea
                    id="description_bn"
                    rows={3}
                    value={formData.description_bn}
                    onChange={e => updateField("description_bn", e.target.value)}
                    className="resize-none"
                    dir="auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Timeline */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={2} label="Event Timeline" icon={<Calendar className="w-4 h-4" />} />
              <div className="p-4 mb-5 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-300/80">
                  Dates drive the automatic lifecycle transitions.
                  <strong className="text-blue-300"> Exhibition Year</strong> is derived from the start date — only one exhibition per year is allowed.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Registration Opens" hint="When artists can start applying.">
                  <Input
                    id="registration_start"
                    type="date"
                    value={formData.registration_start}
                    onChange={e => updateField("registration_start", e.target.value)}
                    className="h-11"
                  />
                </Field>
                <Field label="Submission Deadline" hint="Last day for artwork submission.">
                  <Input
                    id="submission_end"
                    type="date"
                    value={formData.submission_end}
                    onChange={e => updateField("submission_end", e.target.value)}
                    min={formData.registration_start || undefined}
                    className="h-11"
                  />
                </Field>
                <Field label="Exhibition Opens" required hint="Triggers auto-transition to 'Ongoing'.">
                  <Input
                    id="exhibition_start"
                    type="date"
                    value={formData.exhibition_start}
                    onChange={e => updateField("exhibition_start", e.target.value)}
                    min={formData.submission_end || undefined}
                    className="h-11"
                  />
                </Field>
                <Field label="Exhibition Closes" hint="Triggers auto-transition to 'Archived'.">
                  <Input
                    id="exhibition_end"
                    type="date"
                    value={formData.exhibition_end}
                    onChange={e => updateField("exhibition_end", e.target.value)}
                    min={formData.exhibition_start || undefined}
                    className="h-11"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Hero Banner */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-purple-500 via-purple-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={3} label="Hero Banner" icon={<ImageIcon className="w-4 h-4" />} />
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  isDragging
                    ? "border-accent bg-accent/10 scale-[1.01]"
                    : "border-border hover:border-accent/50 hover:bg-accent/5"
                } ${heroPreviewUrl ? "p-0 overflow-hidden" : "p-8 md:p-12"}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {heroPreviewUrl ? (
                  <div className="relative w-full aspect-[16/7]">
                    <Image
                      src={heroPreviewUrl}
                      alt="Hero banner preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                      type="button"
                      onClick={() => { setHeroImageFile(null); setHeroPreviewUrl("") }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                      {heroImageFile?.name} · {heroImageFile ? (heroImageFile.size / 1024 / 1024).toFixed(1) : 0} MB
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl border border-dashed border-accent/40 bg-accent/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <Upload className="w-7 h-7 text-accent" />
                    </div>
                    <p className="font-semibold text-base mb-1">Drag & drop or click to upload</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG, or WebP · Max 10 MB</p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">Recommended: 1920 × 680 px</p>
                    <input
                      id="hero_banner_input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]) }}
                    />
                  </label>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                The hero banner is optional at creation. You can upload it later from the exhibition dashboard.
              </p>
            </CardContent>
          </Card>

          {/* Section 4: Venue */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-500/60 to-transparent" />
            <CardContent className="p-6 pt-7">
              <SectionBadge number={4} label="Venue" icon={<MapPin className="w-4 h-4" />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Venue — English" hint="Gallery or location name.">
                  <Input
                    id="venue_en"
                    value={formData.venue_en}
                    onChange={e => updateField("venue_en", e.target.value)}
                    placeholder="e.g. Silva Tirtha Art Gallery, Dhaka"
                    className="h-11"
                  />
                </Field>
                <Field label="স্থান — বাংলা">
                  <Input
                    id="venue_bn"
                    value={formData.venue_bn}
                    onChange={e => updateField("venue_bn", e.target.value)}
                    placeholder="যেমন: শিল্পতীর্থ গ্যালারি, ঢাকা"
                    className="h-11"
                    dir="auto"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Sticky preview + actions ─────────── */}
        <div className="xl:sticky xl:top-24 space-y-6">

          {/* Live Preview Card */}
          <Card className="overflow-hidden border border-border/60">
            <div className="h-1 w-full bg-gradient-to-r from-accent to-transparent" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                Live Preview
              </CardTitle>
              <CardDescription className="text-xs">How this exhibition will appear in the roster.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mini exhibition card mockup */}
              <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
                {heroPreviewUrl ? (
                  <Image src={heroPreviewUrl} alt="preview" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full border backdrop-blur-md bg-white/10 text-white border-white/20">
                    Draft
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-mono text-accent/80 tracking-widest uppercase mb-1">
                    {startYear} Season
                  </p>
                  <p className="font-serif text-white text-lg font-semibold leading-tight line-clamp-2">
                    {formData.theme_en || "Exhibition Title"}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent/60" />
                  <span className="text-xs">{formattedDateRange}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent/60" />
                  <span className="text-xs">{formData.venue_en || "Venue TBD"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Checklist */}
          <Card className="border border-border/60">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Setup Checklist
                <span className="ml-auto text-xs font-normal text-muted-foreground">{completedCount}/4</span>
              </p>
              {sections.map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    s.filled
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "border-border/60 text-transparent"
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span className={`text-sm ${s.filled ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !formData.theme_en.trim()}
              id="create-exhibition-submit"
              className="relative w-full h-12 rounded-xl font-semibold text-sm overflow-hidden transition-all
                bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground
                hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]
                disabled:pointer-events-none disabled:opacity-50
                shadow-lg shadow-accent/20"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Initialising Exhibition…</>
                  : <><Sparkles className="w-4 h-4" /> Create Exhibition <ArrowRight className="w-4 h-4" /></>
                }
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

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            The exhibition will be saved as a <strong>Draft</strong>. You can configure catalogs, gallery, and moderation from the dashboard.
          </p>
        </div>
      </div>
    </form>
  )
}
