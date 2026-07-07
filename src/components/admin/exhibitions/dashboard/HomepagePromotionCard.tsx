'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateExhibitionFeatureStatus } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function HomepagePromotionCard({ exhibition }: { exhibition: any }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isFeatured, setIsFeatured] = React.useState(exhibition.is_featured || false)

  const handleToggle = async (checked: boolean) => {
    setIsFeatured(checked)
    try {
      setIsSubmitting(true)
      const res = await updateExhibitionFeatureStatus(exhibition.id, checked)
      if (res.error) throw new Error(res.error)
      toast.success(checked ? "Featured on Homepage" : "Removed from Homepage")
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message })
      setIsFeatured(!checked) // revert
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Promotion</CardTitle>
        <CardDescription>Feature this exhibition prominently on the homepage.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base">Feature Exhibition</Label>
            <p className="text-sm text-muted-foreground">
              This will override the default chronological ordering on the homepage. Only one exhibition can be featured at a time.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Switch 
              checked={isFeatured} 
              onCheckedChange={handleToggle} 
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
