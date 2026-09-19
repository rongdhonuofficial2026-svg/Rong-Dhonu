'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateExhibition } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { Loader2, Upload, X, Smartphone } from "lucide-react"
import Image from "next/image"

// 9 allowed focal-point values (CSS object-position compatible)
const FOCAL_POINTS = [
  { label: 'Left · Top',      value: 'left top',      x: 0,   y: 0   },
  { label: 'Center · Top',    value: 'center top',    x: 50,  y: 0   },
  { label: 'Right · Top',     value: 'right top',     x: 100, y: 0   },
  { label: 'Left · Middle',   value: 'left center',   x: 0,   y: 50  },
  { label: 'Center',          value: 'center center', x: 50,  y: 50  },
  { label: 'Right · Middle',  value: 'right center',  x: 100, y: 50  },
  { label: 'Left · Bottom',   value: 'left bottom',   x: 0,   y: 100 },
  { label: 'Center · Bottom', value: 'center bottom', x: 50,  y: 100 },
  { label: 'Right · Bottom',  value: 'right bottom',  x: 100, y: 100 },
]

function FocalPointPicker({
  imageUrl,
  value,
  onChange,
}: {
  imageUrl: string
  value: string
  onChange: (v: string) => void
}) {
  const currentPoint = FOCAL_POINTS.find(p => p.value === value) ?? FOCAL_POINTS[4]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Smartphone className="w-4 h-4" />
        Mobile Focal Point
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
          {currentPoint.label}
        </span>
      </div>

      {/* Phone frame preview */}
      <div className="flex justify-center">
        <div
          className="relative rounded-[22px] overflow-hidden border-[3px] border-border shadow-lg"
          style={{ width: 130, height: 230 }}
        >
          {/* Banner image with the selected focal point */}
          <img
            src={imageUrl}
            alt="Mobile preview"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: value }}
          />

          {/* Dark scrim so pins are visible */}
          <div className="absolute inset-0 bg-black/20" />

          {/* 3×3 grid of clickable focal-point buttons */}
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)' }}
          >
            {FOCAL_POINTS.map(point => {
              const isActive = point.value === value
              return (
                <button
                  key={point.value}
                  type="button"
                  title={point.label}
                  onClick={() => onChange(point.value)}
                  className="flex items-center justify-center transition-all"
                >
                  <span
                    className={`rounded-full border-2 transition-all ${
                      isActive
                        ? 'w-4 h-4 bg-yellow-400 border-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                        : 'w-2.5 h-2.5 bg-white/60 border-white/80 hover:bg-white hover:scale-125'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tap a dot to set which part of the banner shows on phones
      </p>
    </div>
  )
}

export function HeroBannerCard({ exhibition }: { exhibition: any }) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const [heroImageUrl, setHeroImageUrl] = React.useState(exhibition.hero_image_url || "")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [mobileFocalPoint, setMobileFocalPoint] = React.useState(
    exhibition.mobile_image_position || 'center center'
  )

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setHeroImageUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      let finalUrl = heroImageUrl

      if (imageFile) {
        setUploadProgress(10)
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `exhibition-hero-${Date.now()}.${fileExt}`
        const filePath = `exhibitions/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, imageFile, { upsert: false })

        if (uploadError) throw uploadError

        setUploadProgress(100)
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath)
        finalUrl = publicUrl
      }

      const res = await updateExhibition(exhibition.id, {
        ...exhibition,
        hero_image_url: finalUrl,
        mobile_image_position: mobileFocalPoint,
      })
      if (res.error) throw new Error(res.error)
      toast.success("Hero banner updated")
      setImageFile(null)
    } catch (err: any) {
      toast.error("Failed to update banner", { description: err.message })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const hasChanges =
    imageFile !== null ||
    (heroImageUrl !== exhibition.hero_image_url && heroImageUrl === "") ||
    mobileFocalPoint !== (exhibition.mobile_image_position || 'center center')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Banner</CardTitle>
        <CardDescription>
          Upload a high-quality banner, then set the mobile focal point so the right part of
          the image shows on phones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Desktop preview / upload zone ── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Desktop Preview
          </p>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px] bg-muted/10 relative">
            {heroImageUrl ? (
              <div className="relative w-full h-[200px]">
                <Image src={heroImageUrl} alt="Preview" fill className="object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => {
                    setHeroImageUrl("")
                    setImageFile(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                {/* Replace image button */}
                <label className="absolute bottom-2 left-2 cursor-pointer">
                  <span className="text-xs bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors">
                    Replace image
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
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
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-8 z-10 backdrop-blur-sm rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                <p className="font-medium">Uploading image...</p>
                <div className="w-full max-w-xs h-2 bg-muted mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile focal-point picker (only shown when there is an image) ── */}
        {heroImageUrl && (
          <div className="border border-border rounded-xl p-4 bg-muted/5">
            <FocalPointPicker
              imageUrl={heroImageUrl}
              value={mobileFocalPoint}
              onChange={setMobileFocalPoint}
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges || isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Banner
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
