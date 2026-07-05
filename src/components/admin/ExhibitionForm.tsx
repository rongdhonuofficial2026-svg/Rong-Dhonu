'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { createExhibition, updateExhibition } from "@/actions/admin/exhibitions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

export function ExhibitionForm({ initialData = null, locale }: { initialData?: any, locale: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const [formData, setFormData] = React.useState({
    title_en: initialData?.title_en || "",
    title_bn: initialData?.title_bn || "",
    description_en: initialData?.description_en || "",
    description_bn: initialData?.description_bn || "",
    start_date: initialData?.start_date ? initialData.start_date.split('T')[0] : "",
    end_date: initialData?.end_date ? initialData.end_date.split('T')[0] : "",
    registration_start: initialData?.registration_start ? initialData.registration_start.split('T')[0] : "",
    registration_end: initialData?.registration_end ? initialData.registration_end.split('T')[0] : "",
    venue_en: initialData?.venue_en || "",
    venue_bn: initialData?.venue_bn || "",
    status: initialData?.status || "draft",
    hero_image_url: initialData?.hero_image_url || "",
    image_file: null as File | null
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      updateField('image_file', file)
      updateField('hero_image_url', URL.createObjectURL(file))
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    setUploadProgress(10)
    const fileExt = file.name.split('.').pop()
    const fileName = `exhibition-${Date.now()}.${fileExt}`
    const filePath = `exhibitions/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, { upsert: false })
      
    if (uploadError) throw uploadError

    setUploadProgress(100)
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      
      let finalImageUrl = formData.hero_image_url
      if (formData.image_file) {
        finalImageUrl = await uploadImageToSupabase(formData.image_file)
      }

      const payload = { ...formData, hero_image_url: finalImageUrl }
      let res

      if (initialData?.id) {
        res = await updateExhibition(initialData.id, payload)
      } else {
        res = await createExhibition(payload)
      }

      if (res.error) throw new Error(res.error)

      toast.success(initialData ? "Exhibition Updated" : "Exhibition Created")
      router.push(`/${locale}/admin/exhibitions`)
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (English) *</label>
              <Input value={formData.title_en} onChange={(e) => updateField('title_en', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (Bengali)</label>
              <Input value={formData.title_bn} onChange={(e) => updateField('title_bn', e.target.value)} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description (English)</label>
              <Textarea rows={3} value={formData.description_en} onChange={(e) => updateField('description_en', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description (Bengali)</label>
              <Textarea rows={3} value={formData.description_bn} onChange={(e) => updateField('description_bn', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Start Date</label>
              <Input type="date" value={formData.registration_start} onChange={(e) => updateField('registration_start', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration End Date</label>
              <Input type="date" value={formData.registration_end} onChange={(e) => updateField('registration_end', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exhibition Start Date</label>
              <Input type="date" value={formData.start_date} onChange={(e) => updateField('start_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exhibition End Date</label>
              <Input type="date" value={formData.end_date} onChange={(e) => updateField('end_date', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue (English)</label>
              <Input value={formData.venue_en} onChange={(e) => updateField('venue_en', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue (Bengali)</label>
              <Input value={formData.venue_bn} onChange={(e) => updateField('venue_bn', e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <label className="text-sm font-medium block mb-4">Hero Banner Image</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-muted/10 relative">
            {formData.hero_image_url ? (
              <div className="relative w-full h-[250px]">
                <Image src={formData.hero_image_url} alt="Preview" fill className="object-cover rounded-lg" />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => {
                    updateField('hero_image_url', '')
                    updateField('image_file', null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Click to upload Hero Banner</p>
                <p className="text-sm text-muted-foreground mt-2">JPG, PNG, WebP recommended</p>
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Save Changes" : "Create Exhibition")}
        </Button>
      </div>
    </form>
  )
}
