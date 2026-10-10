'use client'

/**
 * Thin client wrapper that passes the late-submission token and exhibition ID
 * through to SubmissionWizard as hidden metadata.
 *
 * The raw token is forwarded to submitArtwork() inside handleSubmit.
 * It is never persisted to localStorage (draft saving excludes it).
 * It lives only in React component state for the lifetime of this page session.
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitArtwork } from '@/actions/artwork'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, X, Check, Loader2, ArrowRight, ArrowLeft, AlertCircle, ExternalLink, Lock } from 'lucide-react'
import Image from 'next/image'

const DRAFT_KEY = 'rongdhonu_late_draft_v1'

interface Exhibition {
  id: string
  title_en: string
  title_bn?: string
  submission_end?: string | null
}

interface LateSubmissionWrapperProps {
  locale: string
  exhibition: Exhibition
  rawToken: string
  exhibitionId: string
}

const CATEGORIES = [
  'Painting', 'Watercolor', 'Acrylic', 'Oil', 'Sculpture',
  'Digital Art', 'Photography', 'Mixed Media', 'Drawing', 'Printmaking',
  'Textile', 'Calligraphy', 'Other',
]

export function LateSubmissionWrapper({
  locale,
  exhibition,
  rawToken,
  exhibitionId,
}: LateSubmissionWrapperProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [agreed, setAgreed] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title_en: '',
    title_bn: '',
    theme: '',
    category: '',
    description_en: '',
    description_bn: '',
    medium_en: '',
    medium_bn: '',
    height: '',
    width: '',
    framed: false,
    price: '',
    availability: 'not_for_sale',
    main_image_url: '',
    image_file: null as File | null,
  })

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setFormData(prev => ({ ...prev, ...parsed, image_file: null }))
      } catch { /* ignore */ }
    }
  }, [])

  // Auto-save draft (exclude token — never persisted)
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_file, ...savable } = formData
    localStorage.setItem(DRAFT_KEY, JSON.stringify(savable))
  }, [formData])

  const updateField = (field: string, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleNext = () => {
    if (step === 1 && !formData.title_en.trim()) {
      toast.error(locale === 'bn' ? 'শিরোনাম আবশ্যক' : 'Title Required',
        { description: locale === 'bn' ? 'ইংরেজিতে শিল্পকর্মের শিরোনাম দিন।' : 'Please enter the artwork title in English.' })
      return
    }
    if (step === 5 && !formData.main_image_url && !formData.image_file) {
      toast.error(locale === 'bn' ? 'ছবি আবশ্যক' : 'Image Required',
        { description: locale === 'bn' ? 'পরবর্তী ধাপে যেতে ছবি আপলোড করুন।' : 'Please upload an artwork image before proceeding.' })
      return
    }
    setStep(s => Math.min(s + 1, 6))
  }
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        toast.error(locale === 'bn' ? 'ছবির আকার খুব বড়' : 'Image Too Large',
          { description: locale === 'bn' ? 'সর্বোচ্চ ২MB অনুমোদিত।' : 'Maximum allowed size is 2MB.' })
        e.target.value = ''
        return
      }
      updateField('image_file', file)
      updateField('main_image_url', URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    if (!userId) throw new Error('Not signed in')
    setUploadProgress(20)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('artworks_optimized').upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    setUploadProgress(90)
    const { data: { publicUrl } } = supabase.storage.from('artworks_optimized').getPublicUrl(path)
    setUploadProgress(100)
    return publicUrl
  }

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('Agreement Required', { description: 'Please agree to the terms before submitting.' })
      return
    }
    if (!formData.title_en.trim()) {
      toast.error('Title Required', { description: 'Please enter the artwork title.' })
      return
    }
    if (!formData.main_image_url && !formData.image_file) {
      toast.error(locale === 'bn' ? 'ছবি আবশ্যক' : 'Image Required',
        { description: locale === 'bn' ? 'ছবি আপলোড করুন।' : 'Please upload an artwork image.' })
      setStep(5)
      return
    }

    try {
      setIsSubmitting(true)
      setUploadProgress(0)

      let finalImageUrl = formData.main_image_url
      if (formData.image_file) {
        toast.loading('Uploading image...', { id: 'upload-toast' })
        finalImageUrl = await uploadImage(formData.image_file)
        toast.dismiss('upload-toast')
      }

      // Critical: pass rawToken and exhibitionId so submitArtwork can validate
      // and bypass the deadline. These are sent as part of the server action
      // payload — never stored in the DB, never exposed to other users.
      const res = await submitArtwork({
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
        exhibitionId: exhibition.id,
        // Late-token fields — validated on the server
        lateToken: rawToken,
        lateTokenExhibitionId: exhibitionId,
      })

      if (res.error) throw new Error(res.error)

      toast.success(
        locale === 'bn' ? 'সফলভাবে জমা দেওয়া হয়েছে!' : 'Submission Successful!',
        { description: locale === 'bn' ? 'আপনার শিল্পকর্ম পর্যালোচনার জন্য পাঠানো হয়েছে।' : 'Your artwork has been submitted and is pending review.' }
      )

      localStorage.removeItem(DRAFT_KEY)
      router.push(`/${locale}/dashboard/artworks`)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      toast.error('Submission Failed', { description: msg })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Lock badge — reminds participant this is a privileged link */}
      <div className="flex items-center gap-2 mb-6 text-xs font-semibold text-amber-800 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 w-fit">
        <Lock className="w-3.5 h-3.5" />
        {locale === 'bn' ? 'বিশেষ অনুমতিপ্রাপ্ত জমা' : 'Late Submission — Admin Authorized'}
      </div>

      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-8 relative px-2 sm:px-0">
        <div className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 w-[calc(100%-16px)] sm:w-full h-1 bg-[#E5E0D8] -z-10 rounded-full" />
        <div
          className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 h-1 bg-charcoal -z-10 rounded-full transition-all duration-500 ease-out"
          style={{ width: `calc(${((step - 1) / 5) * 100}% - ${step === 1 ? '16px' : '0px'})` }}
        />
        {[1, 2, 3, 4, 5, 6].map(num => (
          <div key={num} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 border-2 ${step === num ? 'bg-charcoal text-white border-charcoal scale-110 shadow-md' : step > num ? 'bg-charcoal text-white border-charcoal' : 'bg-[#FAF9F6] border-[#E5E0D8] text-[#6B655C]'}`}>
            {step > num ? <Check className="w-4 h-4" /> : num}
          </div>
        ))}
      </div>

      <Card className="shadow-sm border-[#E5E0D8]/60 rounded-3xl md:rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-b from-[#FAF9F6] to-white border-b border-[#E5E0D8]/60 p-5 sm:p-6 md:p-8">
          <CardTitle className="text-xl sm:text-2xl font-serif text-charcoal">
            {step === 1 && (locale === 'bn' ? 'ধাপ ১: শিরোনাম ও বিভাগ' : 'Step 1: Title & Category')}
            {step === 2 && (locale === 'bn' ? 'ধাপ ২: বিবরণ' : 'Step 2: Description')}
            {step === 3 && (locale === 'bn' ? 'ধাপ ৩: উপকরণ ও পরিমাপ' : 'Step 3: Materials & Dimensions')}
            {step === 4 && (locale === 'bn' ? 'ধাপ ৪: মূল্য' : 'Step 4: Pricing')}
            {step === 5 && (locale === 'bn' ? 'ধাপ ৫: ছবি আপলোড' : 'Step 5: Image Upload')}
            {step === 6 && (locale === 'bn' ? 'ধাপ ৬: পর্যালোচনা ও জমা' : 'Step 6: Review & Submit')}
          </CardTitle>
          <CardDescription className="text-sm mt-1 font-medium text-[#6B655C]/80">
            {locale === 'bn' ? `প্রদর্শনী: ${exhibition.title_bn || exhibition.title_en}` : `Exhibition: ${exhibition.title_en}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 md:p-8 min-h-[400px]">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Title (English) <span className="text-destructive">*</span></label>
                  <Input value={formData.title_en} onChange={e => updateField('title_en', e.target.value)} placeholder="e.g. Morning Rain" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">শিরোনাম (বাংলা)</label>
                  <Input value={formData.title_bn} onChange={e => updateField('title_bn', e.target.value)} placeholder="যেমন: ভোরের বৃষ্টি" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Theme</label>
                  <Input value={formData.theme} onChange={e => updateField('theme', e.target.value)} placeholder="e.g. Nature, Portrait" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Category</label>
                  <Select value={formData.category} onValueChange={v => updateField('category', v)}>
                    <SelectTrigger className="min-h-[44px] rounded-xl border-[#E5E0D8]/80"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E5E0D8]/80 shadow-lg">
                      {CATEGORIES.map(c => <SelectItem key={c} value={c.toLowerCase()} className="py-2.5">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Description (English)</label>
                <Textarea rows={5} value={formData.description_en} onChange={e => updateField('description_en', e.target.value)} placeholder="Describe your artwork..." className="rounded-xl border-[#E5E0D8]/80 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">বিবরণ (বাংলা)</label>
                <Textarea rows={5} value={formData.description_bn} onChange={e => updateField('description_bn', e.target.value)} placeholder="আপনার শিল্পকর্মের বিবরণ লিখুন..." className="rounded-xl border-[#E5E0D8]/80 resize-none" />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Medium (English)</label>
                  <Input value={formData.medium_en} onChange={e => updateField('medium_en', e.target.value)} placeholder="e.g. Watercolor on paper" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">উপকরণ (বাংলা)</label>
                  <Input value={formData.medium_bn} onChange={e => updateField('medium_bn', e.target.value)} placeholder="যেমন: জলরঙ" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Width (inches)</label>
                  <Input type="number" min={1} value={formData.width} onChange={e => updateField('width', e.target.value)} placeholder="e.g. 18" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Height (inches)</label>
                  <Input type="number" min={1} value={formData.height} onChange={e => updateField('height', e.target.value)} placeholder="e.g. 24" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2 md:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-[#E5E0D8] rounded-[4px] checked:bg-charcoal checked:border-charcoal transition-all cursor-pointer" checked={formData.framed} onChange={e => updateField('framed', e.target.checked)} />
                      <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-charcoal">This artwork is framed</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Price (₹)</label>
                  <Input type="number" min={0} value={formData.price} onChange={e => updateField('price', e.target.value)} placeholder="Leave empty if not for sale" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal">Availability</label>
                  <Select value={formData.availability} onValueChange={v => updateField('availability', v)}>
                    <SelectTrigger className="min-h-[44px] rounded-xl border-[#E5E0D8]/80"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E5E0D8]/80 shadow-lg">
                      <SelectItem value="available" className="py-2.5">Available for Sale</SelectItem>
                      <SelectItem value="not_for_sale" className="py-2.5">Not for Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 p-4 rounded-xl bg-muted/30 border text-sm text-muted-foreground">
                  Exhibition: <span className="font-semibold text-foreground">{exhibition.title_en}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-2 border-dashed border-[#E5E0D8] rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[300px] bg-[#FAF9F6] relative overflow-hidden">
                {formData.main_image_url ? (
                  <div className="relative w-full h-[280px] rounded-xl overflow-hidden bg-white shadow-sm border border-[#E5E0D8]/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.main_image_url} alt="Preview" className="w-full h-full object-contain" />
                    <Button variant="destructive" size="icon" className="absolute top-3 right-3 rounded-full" onClick={() => { updateField('main_image_url', ''); updateField('image_file', null) }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer w-full h-full py-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-[#E5E0D8]/60">
                      <Upload className="w-8 h-8 text-accent-gold opacity-80" />
                    </div>
                    <p className="text-lg font-serif font-medium text-charcoal mb-2">
                      {locale === 'bn' ? 'ছবি আপলোড করুন' : 'Click to upload Artwork Image'}
                    </p>
                    <div className="text-xs font-semibold text-amber-900 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      JPG, PNG, WebP — max 2MB
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
                {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-8 z-10 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-accent-gold mb-5" />
                    <p className="font-medium text-charcoal">Uploading image...</p>
                    <div className="w-full max-w-xs h-2.5 bg-[#E5E0D8] mt-5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-gold transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-amber-700 mt-0.5" />
                  <p className="text-sm text-[#6B655C]">{locale === 'bn' ? 'ছবি ২MB এর বেশি হলে কম্প্রেস করুন' : 'Image larger than 2MB? Compress it first.'}</p>
                </div>
                <a href="https://www.iloveimg.com/compress-image" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1C1C] text-white text-xs font-semibold shrink-0">
                  Compress image <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs font-medium text-charcoal/80 flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 text-accent-gold" />
                {locale === 'bn' ? 'পরবর্তী ধাপে যেতে ছবি আপলোড আবশ্যক (সর্বোচ্চ ২MB)।' : 'Image upload required to proceed (max 2MB).'}
              </p>
            </div>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-3xl border border-[#E5E0D8]/60">
                <h3 className="font-serif text-xl font-bold mb-6 text-charcoal border-b border-[#E5E0D8] pb-4">Review Submission</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  {[
                    { label: 'Title', value: formData.title_en || 'Untitled' },
                    { label: 'Medium', value: formData.medium_en || 'Not specified' },
                    { label: 'Dimensions', value: formData.width && formData.height ? `${formData.width} × ${formData.height} in` : 'Not specified' },
                    { label: 'Price', value: formData.price ? `₹${formData.price}` : 'Not for sale' },
                  ].map(item => (
                    <div key={item.label} className="bg-white p-4 rounded-xl border border-[#E5E0D8]/60 shadow-sm">
                      <p className="text-[#6B655C] text-[11px] uppercase tracking-wider font-bold mb-1">{item.label}</p>
                      <p className="font-semibold text-charcoal">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {formData.main_image_url && (
                <div className="rounded-2xl overflow-hidden border border-[#E5E0D8]/60 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.main_image_url} alt="Preview" className="w-full max-h-64 object-cover" />
                </div>
              )}
              <label className="flex items-start gap-4 p-5 border border-[#E5E0D8] rounded-2xl bg-[#FAF9F6] cursor-pointer hover:bg-[#F5F2EB] transition-colors">
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-[#E5E0D8] rounded-[4px] checked:bg-charcoal checked:border-charcoal transition-all cursor-pointer" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                  <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm font-medium text-[#6B655C] leading-relaxed">
                  I confirm this artwork is <strong className="text-charcoal">original</strong>, created by me, and I agree to the Rongdhonu exhibition terms. I understand my submission will be reviewed by the moderation team.
                </span>
              </label>
            </div>
          )}
        </CardContent>

        <div className="p-5 sm:p-6 md:p-8 border-t border-[#E5E0D8]/60 bg-[#FAF9F6] flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isSubmitting} className="w-full sm:w-auto min-h-[44px] rounded-full border-[#E5E0D8] text-charcoal hover:bg-[#F5F2EB]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'bn' ? 'আগে' : 'Previous'}
          </Button>
          {step < 6 ? (
            <Button onClick={handleNext} className="w-full sm:w-auto min-h-[44px] rounded-full bg-charcoal text-white shadow-md">
              {locale === 'bn' ? 'পরবর্তী' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button size="lg" className="w-full sm:w-auto sm:min-w-40 min-h-[44px] rounded-full bg-charcoal text-white shadow-lg" onClick={handleSubmit} disabled={isSubmitting || !agreed}>
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</> : (locale === 'bn' ? 'জমা দিন' : 'Submit Artwork')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
