'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createCatalog, updateCatalog } from '@/actions/catalogs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, FileText, CheckCircle, X, UploadCloud, ImageIcon } from 'lucide-react'
import { GlassPanel } from '@/components/admin/ui/GlassPanel'
import Image from 'next/image'

export function CatalogForm({ 
  exhibitions, 
  initialData = null,
  defaultExhibitionId,
}: { 
  exhibitions: any[], 
  initialData?: any,
  defaultExhibitionId?: string,
}) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0)
  const [coverUploadProgress, setCoverUploadProgress] = useState(0)

  // PDF file state
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [isPdfDragging, setIsPdfDragging] = useState(false)

  // Cover image state
  const [selectedCover, setSelectedCover] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(initialData?.cover_image_url || null)
  const [isCoverDragging, setIsCoverDragging] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    exhibition_id: initialData?.exhibition_id || defaultExhibitionId || '',
    title_en: initialData?.title_en || '',
    title_bn: initialData?.title_bn || '',
    description_en: initialData?.description_en || '',
    description_bn: initialData?.description_bn || '',
    language: initialData?.language || 'bilingual',
    version: initialData?.version || '1.0',
    status: initialData?.status || 'draft',
    pdf_url: initialData?.pdf_url || '',
    cover_image_url: initialData?.cover_image_url || '',
    file_size: initialData?.file_size || 0,
    page_count: initialData?.page_count || '',
    category: initialData?.category || 'exhibition',
    visibility: initialData?.visibility || 'public',
  })

  // Auto-fill titles when an exhibition is selected (only if titles are empty)
  const handleExhibitionChange = (exhibitionId: string) => {
    const exhibition = exhibitions.find(e => e.id === exhibitionId)
    if (exhibition) {
      setFormData(prev => ({
        ...prev,
        exhibition_id: exhibitionId,
        title_en: prev.title_en || `${exhibition.theme_en || 'Annual Exhibition'} ${exhibition.year} Catalog`,
        title_bn: prev.title_bn || (exhibition.theme_bn ? `${exhibition.theme_bn} ${exhibition.year} ক্যাটালগ` : '')
      }))
    }
  }

  // When arriving from exhibition dashboard, auto-fill titles on first render
  useEffect(() => {
    if (defaultExhibitionId && !initialData) {
      handleExhibitionChange(defaultExhibitionId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── PDF File Handling ────────────────────────────────────────────────
  const handlePdfChange = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50 MB limit.')
      return
    }
    setSelectedPdf(file)
  }

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsPdfDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handlePdfChange(file)
  }

  // ── Cover Image Handling ─────────────────────────────────────────────
  const handleCoverChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are accepted for the cover.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be under 5 MB.')
      return
    }
    setSelectedCover(file)
    const objectUrl = URL.createObjectURL(file)
    setCoverPreviewUrl(objectUrl)
  }

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsCoverDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleCoverChange(file)
  }

  // ── Save Handler ─────────────────────────────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (!formData.exhibition_id) return toast.error('Please select an exhibition.')
    if (!formData.title_en.trim()) return toast.error('Please enter an English title.')
    if (!selectedPdf && !formData.pdf_url) return toast.error('Please upload a PDF catalog file.')
    if (!selectedCover && !formData.cover_image_url) return toast.error('Please upload a cover image.')

    setLoading(true)
    let finalPdfUrl = formData.pdf_url
    let finalFileSize = formData.file_size
    let finalCoverUrl = formData.cover_image_url

    try {
      // 1. Upload Cover Image (if new file selected)
      if (selectedCover) {
        setCoverUploadProgress(20)
        const ext = selectedCover.name.split('.').pop() || 'jpg'
        const safeTitle = formData.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
        const coverFileName = `covers/rongdhonu-${safeTitle}-${Date.now()}.${ext}`

        const { data: coverData, error: coverError } = await supabase.storage
          .from('catalogs')
          .upload(coverFileName, selectedCover, { upsert: false, contentType: selectedCover.type })

        if (coverError) throw new Error(`Cover upload failed: ${coverError.message}`)
        setCoverUploadProgress(100)

        const { data: coverUrlData } = supabase.storage.from('catalogs').getPublicUrl(coverData.path)
        finalCoverUrl = coverUrlData.publicUrl
      }

      // 2. Upload PDF (if new file selected)
      if (selectedPdf) {
        setPdfUploadProgress(20)
        const safeTitle = formData.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)
        const fileName = `rongdhonu-${safeTitle}-${Date.now()}.pdf`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('catalogs')
          .upload(fileName, selectedPdf, { upsert: false, contentType: 'application/pdf' })

        if (uploadError) {
          // Cleanup cover if PDF upload fails
          if (selectedCover && finalCoverUrl) {
            const path = finalCoverUrl.split('/').slice(-2).join('/')
            await supabase.storage.from('catalogs').remove([path])
          }
          throw new Error(`PDF upload failed: ${uploadError.message}`)
        }
        
        setPdfUploadProgress(90)
        const { data: publicUrlData } = supabase.storage.from('catalogs').getPublicUrl(uploadData.path)
        finalPdfUrl = publicUrlData.publicUrl
        finalFileSize = selectedPdf.size
        setPdfUploadProgress(100)
      }

      const payload = {
        exhibition_id: formData.exhibition_id,
        title_en: formData.title_en,
        title_bn: formData.title_bn,
        description_en: formData.description_en,
        description_bn: formData.description_bn,
        language: formData.language,
        version: formData.version,
        pdf_url: finalPdfUrl,
        cover_image_url: finalCoverUrl,
        file_size: finalFileSize,
        page_count: formData.page_count ? parseInt(formData.page_count, 10) : null,
        category: formData.category,
        visibility: formData.visibility,
        status: publish ? 'published' : 'draft'
      }

      let res
      if (initialData?.id) {
        res = await updateCatalog(initialData.id, payload)
      } else {
        res = await createCatalog(payload)
      }

      if (!res.success) throw new Error(res.message)

      toast.success(publish ? 'Catalog published successfully!' : 'Catalog saved as draft!')
      router.push(`/${locale}/admin/catalogs`)
      router.refresh()

    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setPdfUploadProgress(0)
      setCoverUploadProgress(0)
    }
  }

  const isEditing = !!initialData?.id

  return (
    <div className="max-w-4xl space-y-8">
      <GlassPanel intensity="medium" className="p-8 rounded-3xl space-y-8">
        
        {/* Exhibition Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 md:col-span-2">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Exhibition *
            </Label>
            <Select 
              value={formData.exhibition_id} 
              onValueChange={handleExhibitionChange}
              disabled={isEditing}
            >
              <SelectTrigger className="bg-black/20 border-white/10 h-12 text-base">
                <SelectValue placeholder={exhibitions.length === 0 ? 'No exhibitions available — create an exhibition first' : 'Select an Exhibition...'} />
              </SelectTrigger>
              <SelectContent>
                {exhibitions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No exhibitions available. Please create an exhibition first.
                  </div>
                ) : (
                  exhibitions.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.theme_en || 'Unnamed Exhibition'} ({ex.year})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {isEditing && (
              <p className="text-xs text-muted-foreground/60 italic">The exhibition cannot be changed after creation.</p>
            )}
            {exhibitions.length === 0 && (
              <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                ⚠️ You must create at least one Exhibition before you can create a Catalog.
              </p>
            )}
          </div>

          {/* Title Fields */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Title (English) *
            </Label>
            <Input 
              value={formData.title_en}
              onChange={e => setFormData({...formData, title_en: e.target.value})}
              placeholder="e.g. Annual Exhibition 2026 Catalog"
              className="bg-black/20 border-white/10 h-12"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Title (Bengali)
            </Label>
            <Input 
              value={formData.title_bn}
              onChange={e => setFormData({...formData, title_bn: e.target.value})}
              placeholder="বাংলা শিরোনাম (ঐচ্ছিক)"
              className="bg-black/20 border-white/10 h-12 font-bengali"
            />
          </div>

          {/* Description Fields */}
          <div className="space-y-3 md:col-span-2">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Description (English)
            </Label>
            <Textarea 
              value={formData.description_en}
              onChange={e => setFormData({...formData, description_en: e.target.value})}
              placeholder="A brief description of the catalog contents..."
              className="bg-black/20 border-white/10 min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Description (Bengali)
            </Label>
            <Textarea 
              value={formData.description_bn}
              onChange={e => setFormData({...formData, description_bn: e.target.value})}
              placeholder="বাংলায় বিবরণ (ঐচ্ছিক)"
              className="bg-black/20 border-white/10 min-h-[80px] resize-none font-bengali"
            />
          </div>

          {/* Language & Version */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Language
            </Label>
            <Select 
              value={formData.language} 
              onValueChange={v => setFormData({...formData, language: v})}
            >
              <SelectTrigger className="bg-black/20 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bilingual">Bilingual (English & Bengali)</SelectItem>
                <SelectItem value="en">English Only</SelectItem>
                <SelectItem value="bn">Bengali Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Version
            </Label>
            <Input 
              value={formData.version}
              onChange={e => setFormData({...formData, version: e.target.value})}
              placeholder="1.0"
              className="bg-black/20 border-white/10 h-12"
            />
          </div>

          {/* Category & Visibility */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Category
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={v => setFormData({...formData, category: v})}
            >
              <SelectTrigger className="bg-black/20 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exhibition">Exhibition</SelectItem>
                <SelectItem value="retrospective">Retrospective</SelectItem>
                <SelectItem value="solo">Solo Exhibition</SelectItem>
                <SelectItem value="group">Group Exhibition</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Visibility
            </Label>
            <Select 
              value={formData.visibility} 
              onValueChange={v => setFormData({...formData, visibility: v})}
            >
              <SelectTrigger className="bg-black/20 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌐 Public — visible to everyone</SelectItem>
                <SelectItem value="private">🔒 Private — admin only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Count */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
              Page Count
            </Label>
            <Input 
              type="number"
              min="1"
              value={formData.page_count}
              onChange={e => setFormData({...formData, page_count: e.target.value})}
              placeholder="e.g. 72"
              className="bg-black/20 border-white/10 h-12"
            />
          </div>
        </div>

        {/* Cover Image Upload Zone */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
            Cover Image {isEditing ? '(Leave empty to keep current)' : '*'}
          </Label>

          <div
            className={`border-2 border-dashed rounded-2xl transition-all duration-200 relative cursor-pointer overflow-hidden
              ${isCoverDragging ? 'border-amber-400/80 bg-amber-500/10' : 'border-white/20 bg-black/10 hover:bg-black/20 hover:border-white/30'}
              ${loading ? 'pointer-events-none opacity-60' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsCoverDragging(true) }}
            onDragLeave={() => setIsCoverDragging(false)}
            onDrop={handleCoverDrop}
            onClick={() => !loading && coverInputRef.current?.click()}
          >
            <input 
              ref={coverInputRef}
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverChange(f) }}
            />

            {coverPreviewUrl ? (
              <div className="relative h-48 w-full group">
                <Image
                  src={coverPreviewUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <span className="text-white font-medium text-sm">Click to replace</span>
                </div>
                <button 
                  type="button"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-500 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); setSelectedCover(null); setCoverPreviewUrl(null); setFormData(p => ({...p, cover_image_url: ''})) }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {coverUploadProgress > 0 && coverUploadProgress < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${coverUploadProgress}%` }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl glass bg-white/5 border border-white/15 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/70" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-foreground">Click or drag & drop cover image</p>
                  <p className="text-sm text-muted-foreground mt-1">JPEG, PNG, WebP — max 5 MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PDF Upload Zone */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">
            Catalog PDF {isEditing ? '(Leave empty to keep current)' : '*'}
          </Label>

          <div 
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 relative cursor-pointer
              ${isPdfDragging ? 'border-amber-400/80 bg-amber-500/10' : 'border-white/20 bg-black/10 hover:bg-black/20 hover:border-white/30'}
              ${loading ? 'pointer-events-none opacity-60' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsPdfDragging(true) }}
            onDragLeave={() => setIsPdfDragging(false)}
            onDrop={handlePdfDrop}
            onClick={() => !loading && document.getElementById('pdf-upload-input')?.click()}
          >
            <input 
              id="pdf-upload-input"
              type="file" 
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfChange(f) }}
            />

            {selectedPdf ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-foreground">{selectedPdf.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {(selectedPdf.size / 1024 / 1024).toFixed(2)} MB — PDF ready to upload
                  </p>
                </div>
                <button 
                  type="button"
                  className="text-xs text-muted-foreground/60 hover:text-rose-400 transition-colors flex items-center gap-1 mt-1"
                  onClick={(e) => { e.stopPropagation(); setSelectedPdf(null) }}
                >
                  <X className="w-3 h-3" /> Remove file
                </button>
              </div>
            ) : formData.pdf_url ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Existing PDF attached</p>
                  {formData.file_size > 0 && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {(formData.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">Click or drag to replace with a new PDF</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl glass bg-white/5 border border-white/15 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-muted-foreground/70" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-foreground">Click or drag & drop PDF here</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF files only, maximum 50 MB</p>
                </div>
              </div>
            )}

            {/* PDF Upload progress bar */}
            {pdfUploadProgress > 0 && pdfUploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${pdfUploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

      </GlassPanel>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="h-11 px-6 text-sm font-medium rounded-xl glass border border-white/20 text-foreground hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={loading || exhibitions.length === 0}
          className="h-11 px-6 text-sm font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Save as Draft'}
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={loading || exhibitions.length === 0}
          className="h-11 px-8 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Saving...' : 'Publish Catalog'}
        </button>
      </div>
    </div>
  )
}
