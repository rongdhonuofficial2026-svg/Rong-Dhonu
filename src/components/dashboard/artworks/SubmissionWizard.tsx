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
import { Upload, X, Check, Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import Image from "next/image"

const DRAFT_KEY = "rongdhono_artwork_draft"

export function SubmissionWizard({ locale, exhibitions }: { locale: string, exhibitions: any[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [userId, setUserId] = React.useState<string | null>(null)

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
    availability: "available",
    exhibitionId: "",
    main_image_url: "",
    image_file: null as File | null
  })

  // Load draft & user ID on mount
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))

    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (e) {}
    }
  }, [])

  // Auto-save draft on change (excluding File object)
  React.useEffect(() => {
    const { image_file, ...savableData } = formData
    localStorage.setItem(DRAFT_KEY, JSON.stringify(savableData))
  }, [formData])

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => setStep(s => Math.min(s + 1, 6))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      updateField('image_file', file)
      
      // Create local preview
      const url = URL.createObjectURL(file)
      updateField('main_image_url', url)
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!userId) throw new Error("Unauthorized")
    
    setUploadProgress(10)
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `submissions/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('artworks_optimized')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
      
    if (uploadError) throw uploadError

    setUploadProgress(100)
    
    const { data: { publicUrl } } = supabase.storage.from('artworks_optimized').getPublicUrl(filePath)
    return publicUrl
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      let finalImageUrl = formData.main_image_url
      
      // If we have a physical file, upload it directly to storage first
      if (formData.image_file) {
        finalImageUrl = await uploadImageToSupabase(formData.image_file)
      }

      // Submit via Server Action
      const payload = {
        ...formData,
        main_image_url: finalImageUrl,
        width: formData.width ? Number(formData.width) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
      }
      const res = await submitArtwork(payload)

      if (res.error) {
        throw new Error(res.error)
      }

      toast.success(locale === 'bn' ? "সফলভাবে জমা দেওয়া হয়েছে!" : "Submission Successful!", {
        description: locale === 'bn' ? "আপনার শিল্পকর্ম পর্যালোচনার জন্য জমা দেওয়া হয়েছে।" : "Your artwork has been submitted for review.",
      })

      // Clear draft
      localStorage.removeItem(DRAFT_KEY)
      router.push(`/${locale}/dashboard/artworks`)
      
    } catch (err: any) {
      toast.error("Error", {
        description: err.message || "Failed to submit artwork."
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

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
              ${step === num ? 'bg-accent text-accent-foreground border-accent' : 
                step > num ? 'bg-accent text-accent-foreground border-accent' : 'bg-background border-border text-muted-foreground'}`}
          >
            {step > num ? <Check className="w-5 h-5" /> : num}
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-2xl font-serif">
            {step === 1 && (locale === 'bn' ? "ধাপ ১: প্রাথমিক তথ্য" : "Step 1: Basic Information")}
            {step === 2 && (locale === 'bn' ? "ধাপ ২: বিস্তারিত" : "Step 2: Artwork Details")}
            {step === 3 && (locale === 'bn' ? "ধাপ ৩: উপকরণ ও পরিমাপ" : "Step 3: Materials & Dimensions")}
            {step === 4 && (locale === 'bn' ? "ধাপ ৪: মূল্য ও প্রদর্শনী" : "Step 4: Pricing & Exhibition")}
            {step === 5 && (locale === 'bn' ? "ধাপ ৫: ছবি আপলোড" : "Step 5: Images Upload")}
            {step === 6 && (locale === 'bn' ? "ধাপ ৬: পর্যালোচনা ও জমা" : "Step 6: Review & Submit")}
          </CardTitle>
          <CardDescription>
            {locale === 'bn' ? "খসড়া স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে।" : "Drafts are auto-saved locally."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (English) *</label>
                  <Input value={formData.title_en} onChange={(e) => updateField('title_en', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (Bengali)</label>
                  <Input value={formData.title_bn} onChange={(e) => updateField('title_bn', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <Input value={formData.theme} onChange={(e) => updateField('theme', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                      <SelectItem value="digital">Digital Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (English) *</label>
                <Textarea rows={4} value={formData.description_en} onChange={(e) => updateField('description_en', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Bengali)</label>
                <Textarea rows={4} value={formData.description_bn} onChange={(e) => updateField('description_bn', e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium (English) *</label>
                  <Input value={formData.medium_en} onChange={(e) => updateField('medium_en', e.target.value)} placeholder="e.g. Oil on Canvas" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium (Bengali)</label>
                  <Input value={formData.medium_bn} onChange={(e) => updateField('medium_bn', e.target.value)} placeholder="উদাঃ ক্যানভাসে তেল" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (inches)</label>
                  <Input type="number" value={formData.width} onChange={(e) => updateField('width', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (inches)</label>
                  <Input type="number" value={formData.height} onChange={(e) => updateField('height', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input type="number" value={formData.price} onChange={(e) => updateField('price', e.target.value)} placeholder="Leave empty if not for sale" />
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
                  <label className="text-sm font-medium">Submit to Exhibition (Optional)</label>
                  <Select value={formData.exhibitionId} onValueChange={(v) => updateField('exhibitionId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select an active exhibition" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Portfolio Only)</SelectItem>
                      {exhibitions.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>{ex.title_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-muted/10 relative">
                {formData.main_image_url ? (
                  <div className="relative w-full h-[250px]">
                    <Image src={formData.main_image_url} alt="Preview" fill className="object-contain" />
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
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Click to upload Main Image</p>
                    <p className="text-sm text-muted-foreground mt-2">JPG, PNG, WebP up to 10MB</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
                
                {isSubmitting && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-8 z-10 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                    <p className="font-medium">Uploading image to secure storage...</p>
                    <div className="w-full max-w-xs h-2 bg-muted mt-4 rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-muted p-6 rounded-xl border border-border">
                <h3 className="font-serif text-xl font-bold mb-6">Review Submission</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium text-lg">{formData.title_en || 'Untiled'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Medium</p>
                    <p className="font-medium">{formData.medium_en || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">{formData.width} x {formData.height}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{formData.price ? `₹${formData.price}` : 'Not for sale'}</p>
                  </div>
                </div>
              </div>
              
              <label className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card cursor-pointer">
                <input type="checkbox" className="mt-1" required />
                <span className="text-sm">I agree that the artwork submitted is original, created by me, and I agree to the Rongdhono exhibition terms and conditions.</span>
              </label>
            </div>
          )}
        </CardContent>
        
        <div className="p-6 border-t border-border bg-muted/10 flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {locale === 'bn' ? "আগে" : "Previous"}
          </Button>
          
          {step < 6 ? (
            <Button onClick={handleNext}>
              {locale === 'bn' ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button size="lg" className="w-40" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (locale === 'bn' ? "জমা দিন" : "Submit Artwork")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
