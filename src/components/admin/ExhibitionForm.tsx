'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { createExhibition } from "@/actions/admin/exhibitions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ExhibitionForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      
      const payload = { ...formData, status: 'draft', hero_image_url: null, is_featured: false }
      const res = await createExhibition(payload)

      if (res.error) throw new Error(res.error)

      toast.success("Exhibition Created", { description: "Welcome to the exhibition dashboard." })
      // Redirect directly to the dashboard
      router.push(`/${locale}/admin/exhibitions/${res.data.id}`)
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme (English) *</label>
              <Input value={formData.theme_en} onChange={(e) => updateField('theme_en', e.target.value)} required placeholder="e.g. Annual Summer Showcase 2026" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme (Bengali)</label>
              <Input value={formData.theme_bn} onChange={(e) => updateField('theme_bn', e.target.value)} placeholder="ঐচ্ছিক" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description (English)</label>
              <Textarea rows={3} value={formData.description_en} onChange={(e) => updateField('description_en', e.target.value)} placeholder="Curatorial statement..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description (Bengali)</label>
              <Textarea rows={3} value={formData.description_bn} onChange={(e) => updateField('description_bn', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exhibition Start Date</label>
              <Input type="date" value={formData.exhibition_start} onChange={(e) => updateField('exhibition_start', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exhibition End Date</label>
              <Input type="date" value={formData.exhibition_end} onChange={(e) => updateField('exhibition_end', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue (English)</label>
              <Input value={formData.venue_en} onChange={(e) => updateField('venue_en', e.target.value)} placeholder="e.g. Silva Tirtha Art Gallery" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue (Bengali)</label>
              <Input value={formData.venue_bn} onChange={(e) => updateField('venue_bn', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSubmitting ? "Initializing..." : "Create Exhibition"}
        </Button>
      </div>
    </form>
  )
}
