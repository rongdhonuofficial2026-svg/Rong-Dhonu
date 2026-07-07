'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateExhibitionStatus } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { Loader2, ArrowRight } from "lucide-react"

export function StatusControlCard({ exhibition }: { exhibition: any }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const STAGES = ['draft', 'upcoming', 'ongoing', 'archived']
  const currentIndex = STAGES.indexOf(exhibition.status)
  const nextStage = currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null

  const handleAdvance = async () => {
    if (!nextStage) return
    try {
      setIsSubmitting(true)
      const res = await updateExhibitionStatus(exhibition.id, nextStage)
      if (res.error) throw new Error(res.error)
      toast.success(`Exhibition advanced to ${nextStage}`)
    } catch (err: any) {
      toast.error("Failed to advance status", { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle Status</CardTitle>
        <CardDescription>Advance the exhibition through its lifecycle stages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
          <div>
            <p className="font-medium capitalize">Current Phase: {exhibition.status}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {exhibition.status === 'draft' && 'Private. Setup gallery and catalog before publishing.'}
              {exhibition.status === 'upcoming' && `Publicly visible. Transitions to Ongoing automatically on start date (${exhibition.exhibition_start ? new Date(exhibition.exhibition_start).toLocaleDateString() : 'TBD'}).`}
              {exhibition.status === 'ongoing' && `Live event. Transitions to Archived automatically after end date (${exhibition.exhibition_end ? new Date(exhibition.exhibition_end).toLocaleDateString() : 'TBD'}).`}
              {exhibition.status === 'archived' && 'Permanent archive. Read-only for visitors.'}
            </p>
          </div>
          {exhibition.status === 'draft' && nextStage && (
            <Button onClick={handleAdvance} disabled={isSubmitting} className="shrink-0 ml-4">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Advance to {nextStage} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {exhibition.status !== 'draft' && (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-md shrink-0 ml-4">
              Auto-Managed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
