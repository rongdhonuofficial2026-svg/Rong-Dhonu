'use client'

import * as React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Check, Clock, AlertTriangle, XCircle, ImageIcon,
  Edit2, RefreshCw, Loader2, ExternalLink
} from "lucide-react"
import { resubmitArtwork } from "@/actions/admin/artworks"
import { toast } from "sonner"

interface ArtworkCardProps {
  artwork: {
    id: string
    title_en: string
    title_bn?: string | null
    main_image_url?: string | null
    status: string
    created_at: string
    category?: string | null
    medium_en?: string | null
    dimensions?: string | null
    price?: number | null
    moderator_feedback?: string | null
    notes?: string | null
    approved_at?: string | null
    exhibition_id?: string | null
    exhibitions?: { id: string; theme_en: string; theme_bn?: string | null; year: number } | Array<{ id: string; theme_en: string; theme_bn?: string | null; year: number }> | null
  }
  locale: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    labelBn: 'পর্যালোচনার অপেক্ষায়',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    icon: Clock,
    description: 'Your artwork has been submitted and is awaiting moderator review.',
  },
  approved: {
    label: 'Approved',
    labelBn: 'অনুমোদিত',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: Check,
    description: 'Your artwork has been approved for the exhibition.',
  },
  changes_requested: {
    label: 'Revision Requested',
    labelBn: 'সংশোধন প্রয়োজন',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: AlertTriangle,
    description: 'The moderator has requested changes to your submission.',
  },
  rejected: {
    label: 'Not Selected',
    labelBn: 'নির্বাচিত হয়নি',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: XCircle,
    description: 'Your artwork was not selected for this exhibition.',
  },
}

export function ArtworkCard({ artwork, locale }: ArtworkCardProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [editData, setEditData] = React.useState({
    description_en: '',
    medium_en:      artwork.medium_en ?? '',
    dimensions:     artwork.dimensions ?? '',
  })

  const statusConfig = STATUS_CONFIG[artwork.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const title = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
  const feedback = artwork.moderator_feedback || artwork.notes

  const exhibition = Array.isArray(artwork.exhibitions)
    ? artwork.exhibitions[0]
    : artwork.exhibitions

  const handleResubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await resubmitArtwork(artwork.id, {
        medium_en:      editData.medium_en || undefined,
        dimensions:     editData.dimensions || undefined,
        description_en: editData.description_en || undefined,
      })
      if (res.error) {
        toast.error('Resubmission Failed', { description: res.error })
      } else {
        toast.success('Revision Submitted!', {
          description: 'Your updated artwork has been sent back for moderator review.',
        })
        setIsEditOpen(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden flex flex-col group">
        {/* Artwork Thumbnail */}
        <div className="relative aspect-[4/3] bg-muted w-full border-b border-border">
          {artwork.main_image_url ? (
            <Image
              src={artwork.main_image_url}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageIcon className="w-10 h-10 opacity-50" />
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="outline" className={`capitalize shadow-sm backdrop-blur-md bg-background/80 flex items-center gap-1.5 ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {locale === 'bn' ? statusConfig.labelBn : statusConfig.label}
            </Badge>
          </div>

          {/* Category Badge */}
          {artwork.category && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="secondary" className="text-xs shadow-sm backdrop-blur-md bg-background/80">
                {artwork.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold line-clamp-1">{title}</h3>
            {exhibition && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {exhibition.year} — {locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-0.5 flex-1">
            {artwork.medium_en && <p><span className="font-medium">Medium:</span> {artwork.medium_en}</p>}
            {artwork.dimensions && <p><span className="font-medium">Dimensions:</span> {artwork.dimensions}</p>}
            <p>Submitted: {new Date(artwork.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            {artwork.approved_at && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                Approved: {new Date(artwork.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Moderator Feedback (shown for revision and rejection) */}
          {feedback && (artwork.status === 'changes_requested' || artwork.status === 'rejected') && (
            <div className={`p-3 rounded-lg border text-sm ${
              artwork.status === 'changes_requested'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
            }`}>
              <p className="font-semibold text-xs uppercase tracking-wide mb-1">
                {artwork.status === 'changes_requested' ? '📝 Moderator Feedback' : '❌ Reason'}
              </p>
              <p className="leading-relaxed">{feedback}</p>
            </div>
          )}

          {/* Approved: Show link to public view */}
          {artwork.status === 'approved' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-sm">
              <Check className="w-4 h-4 shrink-0" />
              <span className="flex-1">Selected for exhibition</span>
              {artwork.exhibition_id && (
                <a
                  href={`/${locale}/exhibitions/${artwork.exhibition_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:underline"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          {artwork.status === 'changes_requested' && (
            <div className="pt-3 border-t border-border mt-auto">
              <Button
                onClick={() => {
                  setEditData({ description_en: '', medium_en: artwork.medium_en ?? '', dimensions: artwork.dimensions ?? '' })
                  setIsEditOpen(true)
                }}
                className="w-full gap-2"
                size="sm"
              >
                <Edit2 className="w-4 h-4" />
                {locale === 'bn' ? 'সংশোধন করুন ও পুনরায় জমা দিন' : 'Edit & Submit Revision'}
              </Button>
            </div>
          )}

          {artwork.status === 'rejected' && (
            <div className="pt-3 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground text-center">
                {locale === 'bn'
                  ? 'নতুন শিল্পকর্ম জমা দিন।'
                  : 'You may submit a new artwork for the next exhibition.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Revision Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="font-serif text-xl">Submit Revision</DialogTitle>
          <p className="text-sm text-muted-foreground -mt-2">
            Update your artwork details based on the moderator&apos;s feedback, then submit for re-review.
          </p>

          {/* Show the feedback prominently */}
          {feedback && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Moderator Feedback</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{feedback}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="revision-medium">Medium</Label>
              <Input
                id="revision-medium"
                value={editData.medium_en}
                onChange={e => setEditData(d => ({ ...d, medium_en: e.target.value }))}
                placeholder="e.g. Oil on canvas"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revision-dimensions">Dimensions</Label>
              <Input
                id="revision-dimensions"
                value={editData.dimensions}
                onChange={e => setEditData(d => ({ ...d, dimensions: e.target.value }))}
                placeholder="e.g. 24 x 36 inches"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revision-desc">Updated Artist Statement</Label>
              <Textarea
                id="revision-desc"
                value={editData.description_en}
                onChange={e => setEditData(d => ({ ...d, description_en: e.target.value }))}
                placeholder="Describe any changes you have made to address the moderator's feedback..."
                className="h-28 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2" onClick={handleResubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Submit Revision
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
