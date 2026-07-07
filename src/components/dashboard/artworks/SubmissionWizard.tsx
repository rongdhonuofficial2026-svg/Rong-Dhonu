'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { submitArtwork } from "@/actions/artwork"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Upload, X, Check, Loader2, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"
import Image from "next/image"

const DRAFT_KEY = "rongdhono_artwork_draft_v2"

interface Exhibition {
  id: string
  title_en: string
  title_bn?: string
  submission_end?: string | null
}

export function SubmissionWizard({ locale, exhibitions }: { locale: string; exhibitions: Exhibition[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [agreed, setAgreed] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title_en: "",
    title_bn: "",
    theme: "",
    category: "",
    description_en: "",
    description_bn: "",
    medium_en: "",
    medium_bn: "",
    height: "",
    width: "",
    framed: false,
    price: "",
    availability: "not_for_sale",
    exhibitionId: exhibitions[0]?.id ?? "",
    main_image_url: "",
    image_file: null as File | null,
  })

  // Load draft & user ID on mount
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))

    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setFormData(prev => ({ ...prev, ...parsed, image_file: null }))
      } catch {
        // ignore corrupt draft
      }
    }
  }, [])

  // Auto-save draft on change (excluding File object)
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_file, ...savableData } = formData
    localStorage.setItem(DRAFT_KEY, JSON.stringify(savableData))
  }, [formData])

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    // Validate required fields per step
    if (step === 1 && !formData.title_en.trim()) {
      toast.error("Title Required", { description: "Please enter the artwork title in English." })
      return
    }
    setStep(s => Math.min(s + 1, 6))
  }
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File Too Large", { description: "Please upload an image under 10MB." })
        return
      }

      updateField('image_file', file)
      const url = URL.createObjectURL(file)
      updateField('main_image_url', url)
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!userId) throw new Error("Not signed in — please refresh and try again.")

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

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error("Agreement Required", { description: "Please agree to the terms before submitting." })
      return
    }
    if (!formData.title_en.trim()) {
      toast.error("Title Required", { description: "Please go back and enter the artwork title." })
      return
    }

    try {
      setIsSubmitting(true)
      setUploadProgress(0)

      let finalImageUrl = formData.main_image_url

      // If we have a physical file object, upload it to storage first
      if (formData.image_file) {
        toast.loading("Uploading image...", { id: "upload-toast" })
        finalImageUrl = await uploadImageToSupabase(formData.image_file)
        toast.dismiss("upload-toast")
      }

      // Submit via Server Action — pass exhibitionId only if it's a real UUID
      const payload = {
        title_en: formData.title_en,
        title_bn: formData.title_bn || undefined,
        description_en: formData.description_en || undefined,
        description_bn: formData.description_bn || undefined,
        medium_en: formData.medium_en || undefined,
        medium_bn: formData.medium_bn || undefined,
        theme: formData.theme || undefined,
        category: formData.category || undefined,
        width: formData.width ? Number(formData.width) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        framed: formData.framed,
        price: formData.price || undefined,
        availability: formData.availability,
        main_image_url: finalImageUrl || undefined,
        exhibitionId: formData.exhibitionId || undefined,
      }

      const res = await submitArtwork(payload)

      if (res.error) {
        throw new Error(res.error)
      }

      toast.success(
        locale === 'bn' ? "সফলভাবে জমা দেওয়া হয়েছে!" : "Submission Successful!",
        {
          description: locale === 'bn'
            ? "আপনার শিল্পকর্ম পর্যালোচনার জন্য জমা দেওয়া হয়েছে।"
            : "Your artwork has been submitted and is now pending review.",
        }
      )

      // Clear draft
      localStorage.removeItem(DRAFT_KEY)
      router.push(`/${locale}/dashboard/artworks`)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      toast.error("Submission Failed", { description: message })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const CATEGORIES = [
    "Painting", "Watercolor", "Acrylic", "Oil", "Sculpture",
    "Digital Art", "Photography", "Mixed Media", "Drawing", "Printmaking",
    "Textile", "Calligraphy", "Other"
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent -z-10 rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div
            key={num}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2
              ${step === num
                ? 'bg-accent text-accent-foreground border-accent'
                : step > num
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-background border-border text-muted-foreground'}`}
          >
            {step > num ? <Check className="w-5 h-5" /> : num}
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-2xl font-serif">
            {step === 1 && (locale === 'bn' ? "ধাপ ১: শিরোনাম ও বিভাগ" : "Step 1: Title & Category")}
            {step === 2 && (locale === 'bn' ? "ধাপ ২: বিবরণ" : "Step 2: Description")}
            {step === 3 && (locale === 'bn' ? "ধাপ ৩: উপকরণ ও পরিমাপ" : "Step 3: Materials & Dimensions")}
            {step === 4 && (locale === 'bn' ? "ধাপ ৪: মূল্য ও প্রদর্শনী" : "Step 4: Pricing & Exhibition")}
            {step === 5 && (locale === 'bn' ? "ধাপ ৫: ছবি আপলোড" : "Step 5: Image Upload")}
            {step === 6 && (locale === 'bn' ? "ধাপ ৬: পর্যালোচনা ও জমা" : "Step 6: Review & Submit")}
          </CardTitle>
          <CardDescription>
            {locale === 'bn' ? "খসড়া স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে।" : "Drafts are auto-saved locally."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 min-h-[400px]">

          {/* Step 1: Title & Category */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (English) <span className="text-destructive">*</span></label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => updateField('title_en', e.target.value)}
                    placeholder="e.g. Morning Rain"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">শিরোনাম (বাংলা)</label>
                  <Input
                    value={formData.title_bn}
                    onChange={(e) => updateField('title_bn', e.target.value)}
                    placeholder="যেমন: ভোরের বৃষ্টি"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <Input
                    value={formData.theme}
                    onChange={(e) => updateField('theme', e.target.value)}
                    placeholder="e.g. Nature, Portrait, Abstract"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (English)</label>
                <Textarea
                  rows={5}
                  value={formData.description_en}
                  onChange={(e) => updateField('description_en', e.target.value)}
                  placeholder="Describe your artwork, its inspiration, technique..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">বিবরণ (বাংলা)</label>
                <Textarea
                  rows={5}
                  value={formData.description_bn}
                  onChange={(e) => updateField('description_bn', e.target.value)}
                  placeholder="আপনার শিল্পকর্মের বিবরণ লিখুন..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Materials & Dimensions */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium (English)</label>
                  <Input
                    value={formData.medium_en}
                    onChange={(e) => updateField('medium_en', e.target.value)}
                    placeholder="e.g. Watercolor on paper"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">উপকরণ (বাংলা)</label>
                  <Input
                    value={formData.medium_bn}
                    onChange={(e) => updateField('medium_bn', e.target.value)}
                    placeholder="যেমন: কাগজে জলরঙ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (inches)</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.width}
                    onChange={(e) => updateField('width', e.target.value)}
                    placeholder="e.g. 18"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (inches)</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    placeholder="e.g. 24"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={formData.framed}
                      onChange={(e) => updateField('framed', e.target.checked)}
                    />
                    <span className="text-sm font-medium">This artwork is framed</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Exhibition */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="Leave empty if not for sale"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <Select value={formData.availability} onValueChange={(v) => updateField('availability', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available for Sale</SelectItem>
                      <SelectItem value="not_for_sale">Not for Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Exhibition</label>
                  {exhibitions.length > 0 ? (
                    <Select value={formData.exhibitionId} onValueChange={(v) => updateField('exhibitionId', v)}>
                      <SelectTrigger><SelectValue placeholder="Select an active exhibition" /></SelectTrigger>
                      <SelectContent>
                        {exhibitions.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id}>{ex.title_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted">
                      No exhibitions are currently active. Your artwork will be saved as a portfolio piece.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Image Upload */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-muted/10 relative">
                {formData.main_image_url ? (
                  <div className="relative w-full h-[250px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.main_image_url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={() => {
                        updateField('main_image_url', '')
                        updateField('image_file', null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer w-full h-full py-8">
                    <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Click to upload Artwork Image</p>
                    <p className="text-sm text-muted-foreground mt-2">JPG, PNG, WebP — max 10MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}

                {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-8 z-10 backdrop-blur-sm rounded-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                    <p className="font-medium">Uploading image to secure storage...</p>
                    <div className="w-full max-w-xs h-2 bg-muted mt-4 rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                An image is recommended but not required. You can add it later.
              </p>
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-muted p-6 rounded-xl border border-border">
                <h3 className="font-serif text-xl font-bold mb-6">Review Submission</h3>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Title</p>
                    <p className="font-semibold text-base">{formData.title_en || <span className="text-muted-foreground italic">Untitled</span>}</p>
                    {formData.title_bn && <p className="text-muted-foreground text-xs mt-0.5">{formData.title_bn}</p>}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Medium</p>
                    <p className="font-medium">{formData.medium_en || <span className="text-muted-foreground italic">Not specified</span>}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Dimensions</p>
                    <p className="font-medium">
                      {formData.width && formData.height
                        ? `${formData.width} × ${formData.height} inches`
                        : <span className="text-muted-foreground italic">Not specified</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Price</p>
                    <p className="font-medium">{formData.price ? `₹${formData.price}` : <span className="text-muted-foreground">Not for sale</span>}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Category</p>
                    <p className="font-medium capitalize">{formData.category || <span className="text-muted-foreground italic">None</span>}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Image</p>
                    <p className="font-medium">{formData.main_image_url ? '✓ Attached' : <span className="text-amber-600">No image</span>}</p>
                  </div>
                </div>
              </div>

              {formData.main_image_url && (
                <div className="rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.main_image_url}
                    alt="Preview"
                    className="w-full max-h-48 object-cover"
                  />
                </div>
              )}

              <label className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-primary"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="text-sm leading-relaxed">
                  I confirm that this artwork is <strong>original</strong>, created by me, and I agree to the Rongdhono exhibition terms and conditions. I understand my submission will be reviewed by the moderation team.
                </span>
              </label>
            </div>
          )}
        </CardContent>

        {/* Navigation Footer */}
        <div className="p-6 border-t border-border bg-muted/10 flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'bn' ? "আগে" : "Previous"}
          </Button>

          {step < 6 ? (
            <Button onClick={handleNext}>
              {locale === 'bn' ? "পরবর্তী" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="min-w-40"
              onClick={handleSubmit}
              disabled={isSubmitting || !agreed}
            >
              {isSubmitting
                ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
                : (locale === 'bn' ? "জমা দিন" : "Submit Artwork")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
