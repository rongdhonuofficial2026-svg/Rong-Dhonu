'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateExhibition } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function BasicInfoCard({ exhibition }: { exhibition: any }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    theme_en: exhibition.theme_en || "",
    theme_bn: exhibition.theme_bn || "",
    description_en: exhibition.description_en || "",
    description_bn: exhibition.description_bn || "",
    exhibition_start: exhibition.exhibition_start ? exhibition.exhibition_start.split('T')[0] : "",
    exhibition_end: exhibition.exhibition_end ? exhibition.exhibition_end.split('T')[0] : "",
    registration_start: exhibition.registration_start ? exhibition.registration_start.split('T')[0] : "",
    submission_end: exhibition.submission_end ? exhibition.submission_end.split('T')[0] : "",
    venue_en: exhibition.venue_en || "",
    venue_bn: exhibition.venue_bn || "",
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const res = await updateExhibition(exhibition.id, { ...exhibition, ...formData })
      if (res.error) throw new Error(res.error)
      toast.success("Basic info updated")
    } catch (err: any) {
      toast.error("Failed to update basic info", { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Update text details, dates, and venue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme (English) *</label>
              <Input value={formData.theme_en} onChange={(e) => updateField('theme_en', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme (Bengali)</label>
              <Input value={formData.theme_bn} onChange={(e) => updateField('theme_bn', e.target.value)} />
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
              <label className="text-sm font-medium">Registration Start</label>
              <Input type="date" value={formData.registration_start} onChange={(e) => updateField('registration_start', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Submission End</label>
              <Input type="date" value={formData.submission_end} onChange={(e) => updateField('submission_end', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exhibition Start</label>
              <Input type="date" value={formData.exhibition_start} onChange={(e) => updateField('exhibition_start', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exhibition End</label>
              <Input type="date" value={formData.exhibition_end} onChange={(e) => updateField('exhibition_end', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Venue (English)</label>
              <Input value={formData.venue_en} onChange={(e) => updateField('venue_en', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue (Bengali)</label>
              <Input value={formData.venue_bn} onChange={(e) => updateField('venue_bn', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Info
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
