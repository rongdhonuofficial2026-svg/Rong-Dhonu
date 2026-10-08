'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateExhibitionStatus } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { Loader2, ArrowRight, AlertCircle, CalendarCheck } from "lucide-react"

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

  // Format a date string for display
  const fmtDate = (d: string | null | undefined) => {
    if (!d) return 'Not set'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const submissionWindowReady =
    exhibition.registration_start &&
    exhibition.submission_end &&
    exhibition.exhibition_start &&
    exhibition.submission_end.slice(0, 10) <= exhibition.exhibition_start.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle Status</CardTitle>
        <CardDescription>Advance the exhibition through its lifecycle stages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
          <div>
            <p className="font-medium capitalize">Current Phase: {exhibition.status}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {exhibition.status === 'draft' && 'Private. Setup gallery and catalog before publishing.'}
              {exhibition.status === 'upcoming' && `Publicly visible. Submissions open until ${fmtDate(exhibition.submission_end)} at 11:59 PM. Auto-transitions to Ongoing on ${fmtDate(exhibition.exhibition_start)}.`}
              {exhibition.status === 'ongoing' && `Live event. Transitions to Archived automatically after end date (${fmtDate(exhibition.exhibition_end)}).`}
              {exhibition.status === 'archived' && 'Permanent archive. Read-only for visitors.'}
            </p>
          </div>
          {exhibition.status === 'draft' && nextStage && (
            <Button onClick={handleAdvance} disabled={isSubmitting} className="shrink-0 ml-4">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Publish (→ Upcoming) <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {exhibition.status !== 'draft' && (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-md shrink-0 ml-4">
              Auto-Managed
            </span>
          )}
        </div>

        {/* Submission window preview — only shown in draft so admin can verify before publishing */}
        {exhibition.status === 'draft' && (
          <div className={`p-4 rounded-xl border flex gap-3 ${submissionWindowReady ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
            {submissionWindowReady
              ? <CalendarCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            }
            <div className="text-sm space-y-1">
              <p className={`font-semibold ${submissionWindowReady ? 'text-emerald-300' : 'text-amber-300'}`}>
                {submissionWindowReady ? 'Submission Window Ready' : 'Submission Window — Action Required'}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Opens:</span> {fmtDate(exhibition.registration_start)}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Closes:</span> {fmtDate(exhibition.submission_end)} at 11:59 PM (Bangladesh Time)
              </p>
              {!submissionWindowReady && (
                <p className="text-amber-400/90 text-xs mt-1">
                  {!exhibition.registration_start || !exhibition.submission_end || !exhibition.exhibition_start
                    ? 'All dates must be set before publishing.'
                    : 'Submission Deadline cannot be after Exhibition Opens date.'}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
