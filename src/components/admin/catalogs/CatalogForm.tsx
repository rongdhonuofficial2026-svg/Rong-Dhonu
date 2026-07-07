'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createCatalog, updateCatalog } from '@/actions/catalogs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, UploadCloud, FileText } from 'lucide-react'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { GlassPanel } from '@/components/admin/ui/GlassPanel'

export function CatalogForm({ 
  exhibitions, 
  initialData = null 
}: { 
  exhibitions: any[], 
  initialData?: any 
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [formData, setFormData] = useState({
    exhibition_id: initialData?.exhibition_id || '',
    title_en: initialData?.title_en || '',
    title_bn: initialData?.title_bn || '',
    description_en: initialData?.description_en || '',
    description_bn: initialData?.description_bn || '',
    language: initialData?.language || 'bilingual',
    version: initialData?.version || '1.0',
    status: initialData?.status || 'draft',
    pdf_url: initialData?.pdf_url || '',
    file_size: initialData?.file_size || 0
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleExhibitionChange = (exhibitionId: string) => {
    const exhibition = exhibitions.find(e => e.id === exhibitionId)
    if (exhibition) {
      setFormData(prev => ({
        ...prev,
        exhibition_id: exhibitionId,
        title_en: prev.title_en || `${exhibition.theme_en || 'Annual Exhibition'} ${exhibition.year} Catalog`,
        title_bn: prev.title_bn || `${exhibition.theme_bn || 'বার্ষিক প্রদর্শনী'} ${exhibition.year} ক্যাটালগ`
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit.')
      return
    }

    setSelectedFile(file)
  }

  const handleSave = async (publish: boolean) => {
    if (!formData.exhibition_id) return toast.error('Please select an exhibition')
    if (!formData.title_en) return toast.error('Please enter a title')
    if (!selectedFile && !formData.pdf_url) return toast.error('Please upload a PDF catalog')

    setLoading(true)
    let finalPdfUrl = formData.pdf_url
    let finalFileSize = formData.file_size

    try {
      // 1. Upload File if new file selected
      if (selectedFile) {
        setUploadProgress(10)
        
        // Auto-generate professional file name: rongdhonu-annual-exhibition-2027-catalog.pdf
        const safeTitle = formData.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const fileName = `rongdhonu-${safeTitle}-${Date.now()}.pdf`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('catalogs')
          .upload(fileName, selectedFile, {
            upsert: false,
            contentType: 'application/pdf'
          })

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
        
        setUploadProgress(100)
        
        const { data: publicUrlData } = supabase.storage
          .from('catalogs')
          .getPublicUrl(uploadData.path)

        finalPdfUrl = publicUrlData.publicUrl
        finalFileSize = selectedFile.size
      }

      // 2. Save DB Record
      const payload = {
        ...formData,
        pdf_url: finalPdfUrl,
        file_size: finalFileSize,
        status: publish ? 'published' : formData.status // Keep existing if just saving, or force publish
      }

      let res
      if (initialData?.id) {
        res = await updateCatalog(initialData.id, payload)
      } else {
        res = await createCatalog(payload)
      }

      if (!res.success) {
        throw new Error(res.message)
      }

      toast.success(publish ? 'Catalog published successfully!' : 'Catalog saved successfully!')
      router.push('/admin/catalogs')
      router.refresh()

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <GlassPanel intensity="medium" className="p-8 rounded-3xl space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label>Exhibition *</Label>
            <Select 
              value={formData.exhibition_id} 
              onValueChange={handleExhibitionChange}
              disabled={!!initialData?.id} // Cannot change exhibition after creation
            >
              <SelectTrigger className="bg-black/20 border-white/10 h-12">
                <SelectValue placeholder="Select Exhibition..." />
              </SelectTrigger>
              <SelectContent>
                {exhibitions.map(ex => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.theme_en || 'Unnamed Exhibition'} ({ex.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Language</Label>
            <Select 
              value={formData.language} 
              onValueChange={v => setFormData({...formData, language: v})}
            >
              <SelectTrigger className="bg-black/20 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English Only</SelectItem>
                <SelectItem value="bn">Bengali Only</SelectItem>
                <SelectItem value="bilingual">Bilingual (English & Bengali)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Title (English) *</Label>
            <Input 
              value={formData.title_en}
              onChange={e => setFormData({...formData, title_en: e.target.value})}
              className="bg-black/20 border-white/10 h-12"
            />
          </div>

          <div className="space-y-3">
            <Label>Title (Bengali)</Label>
            <Input 
              value={formData.title_bn}
              onChange={e => setFormData({...formData, title_bn: e.target.value})}
              className="bg-black/20 border-white/10 h-12 font-bengali"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label>Description (English)</Label>
            <Textarea 
              value={formData.description_en}
              onChange={e => setFormData({...formData, description_en: e.target.value})}
              className="bg-black/20 border-white/10 min-h-[100px]"
            />
          </div>
        </div>

        {/* PDF UPLOAD ZONE */}
        <div className="space-y-3">
          <Label>Catalog PDF File (Max 50MB) *</Label>
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-black/10 hover:bg-black/20 transition-colors relative">
            
            <input 
              type="file" 
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              disabled={loading}
            />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center bg-white/5 border border-white/10">
                <FileText className="w-8 h-8 text-amber-400/80" />
              </div>
              <div>
                <p className="font-medium text-lg">
                  {selectedFile ? selectedFile.name : (formData.pdf_url ? 'Replace existing PDF...' : 'Click or drag PDF to upload')}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {selectedFile 
                    ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` 
                    : (formData.file_size ? `Current file size: ${(formData.file_size / 1024 / 1024).toFixed(2)} MB` : 'Must be a valid .pdf file under 50MB')}
                </p>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

      </GlassPanel>

      <div className="flex justify-end gap-4">
        <PremiumButton 
          variant="glass" 
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </PremiumButton>
        <PremiumButton 
          variant="secondary" 
          onClick={() => handleSave(false)}
          isLoading={loading && formData.status !== 'published'}
          disabled={loading}
        >
          {initialData?.id ? 'Save Changes' : 'Save as Draft'}
        </PremiumButton>
        <PremiumButton 
          variant="primary" 
          onClick={() => handleSave(true)}
          isLoading={loading && formData.status === 'published'}
          disabled={loading}
        >
          Publish Catalog
        </PremiumButton>
      </div>
    </div>
  )
}
