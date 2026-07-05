'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCatalog, updateCatalog } from '@/actions/admin/catalogs'
import { toast } from 'sonner'
import { Loader2, UploadCloud } from 'lucide-react'

export function CatalogForm({ initialData, exhibitions }: { initialData?: any, exhibitions: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    exhibition_id: initialData?.exhibition_id || '',
    year: initialData?.year || new Date().getFullYear(),
    title_en: initialData?.title_en || '',
    title_bn: initialData?.title_bn || '',
    description_en: initialData?.description_en || '',
    description_bn: initialData?.description_bn || '',
    language: initialData?.language || 'bilingual',
    version: initialData?.version || '1.0',
    status: initialData?.status || 'draft',
    change_notes: initialData?.change_notes || ''
  })

  const handleUpload = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`
    
    const { error: uploadError } = await supabase.storage.from('catalogs').upload(filePath, file)
    if (uploadError) throw uploadError
    
    const { data } = supabase.storage.from('catalogs').getPublicUrl(filePath)
    return data.publicUrl
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let pdf_url = initialData?.pdf_url || ''
      let cover_image_url = initialData?.cover_image_url || null

      if (pdfFile) {
        pdf_url = await handleUpload(pdfFile, 'pdfs')
      }
      if (coverFile) {
        cover_image_url = await handleUpload(coverFile, 'covers')
      }

      if (!pdf_url) {
        throw new Error('PDF file is required')
      }

      const payload = {
        ...formData,
        pdf_url,
        cover_image_url,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      }

      const res = initialData 
        ? await updateCatalog(initialData.id, payload)
        : await createCatalog(payload as any)

      if (res.error) throw new Error(res.error)

      toast.success(initialData ? 'Catalog updated' : 'Catalog uploaded')
      router.push('/en/admin/catalogs')
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-3xl">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Exhibition</label>
          <Select value={formData.exhibition_id} onValueChange={(v) => setFormData({...formData, exhibition_id: v})}>
            <SelectTrigger><SelectValue placeholder="Select Exhibition" /></SelectTrigger>
            <SelectContent>
              {exhibitions.map(ex => (
                <SelectItem key={ex.id} value={ex.id}>{ex.theme_en} ({ex.year})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title (English)</label>
          <Input required value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Title (Bengali)</label>
          <Input value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select value={formData.language} onValueChange={(v) => setFormData({...formData, language: v})}>
            <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bilingual">Bilingual</SelectItem>
              <SelectItem value="en">English Only</SelectItem>
              <SelectItem value="bn">Bengali Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Version Number</label>
          <Input required value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} />
        </div>
      </div>

      <div className="space-y-4 p-6 border border-dashed rounded-lg bg-muted/20">
        <div className="space-y-2">
          <label className="text-sm font-medium">PDF Document {initialData && <span className="text-xs text-muted-foreground">(Leave empty to keep current)</span>}</label>
          <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} required={!initialData} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>
          <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Update Catalog' : 'Upload Catalog'}
      </Button>
    </form>
  )
}
