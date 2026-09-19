'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateExhibition } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { 
  Loader2, 
  Upload, 
  X, 
  Smartphone, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Image from "next/image"

interface FocalState {
  x: number // 0 to 100
  y: number // 0 to 100
  zoom: number // 1.0 to 2.5
}

function parseFocalString(raw?: string | null): FocalState {
  if (!raw) return { x: 50, y: 50, zoom: 1 }
  
  let posStr = raw
  let zoom = 1

  if (raw.includes('/')) {
    const [p, z] = raw.split('/')
    posStr = p.trim()
    zoom = parseFloat(z.trim()) || 1
  }

  // Check for keyword positions
  if (posStr === 'center center' || posStr === 'center') return { x: 50, y: 50, zoom }
  if (posStr === 'left top') return { x: 0, y: 0, zoom }
  if (posStr === 'center top') return { x: 50, y: 0, zoom }
  if (posStr === 'right top') return { x: 100, y: 0, zoom }
  if (posStr === 'left center') return { x: 0, y: 50, zoom }
  if (posStr === 'right center') return { x: 100, y: 50, zoom }
  if (posStr === 'left bottom') return { x: 0, y: 100, zoom }
  if (posStr === 'center bottom') return { x: 50, y: 100, zoom }
  if (posStr === 'right bottom') return { x: 100, y: 100, zoom }

  // Check for percentages "X% Y%"
  const parts = posStr.split(' ').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const parsedX = parseFloat(parts[0])
    const parsedY = parseFloat(parts[1])
    if (!isNaN(parsedX) && !isNaN(parsedY)) {
      return {
        x: Math.max(0, Math.min(100, Math.round(parsedX))),
        y: Math.max(0, Math.min(100, Math.round(parsedY))),
        zoom: Math.max(1, Math.min(2.5, zoom))
      }
    }
  }

  return { x: 50, y: 50, zoom }
}

function formatFocalString(focal: FocalState): string {
  const x = Math.round(focal.x)
  const y = Math.round(focal.y)
  const zoom = Number(focal.zoom.toFixed(2))

  if (x === 50 && y === 50 && zoom === 1) {
    return 'center center'
  }
  if (zoom > 1) {
    return `${x}% ${y}% / ${zoom}`
  }
  return `${x}% ${y}%`
}

function MobileFocalCustomizer({
  imageUrl,
  focal,
  onChange,
}: {
  imageUrl: string
  focal: FocalState
  onChange: (f: FocalState) => void
}) {
  const miniMapRef = React.useRef<HTMLDivElement>(null)
  const phonePreviewRef = React.useRef<HTMLDivElement>(null)

  // Dragging state on MiniMap
  const [isDraggingMap, setIsDraggingMap] = React.useState(false)
  // Dragging state on Phone Preview
  const [isDraggingPhone, setIsDraggingPhone] = React.useState(false)
  const dragStartRef = React.useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 50,
    startY: 50,
  })

  // Mini-map direct click / drag handler
  const handleMapPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!miniMapRef.current) return
    const rect = miniMapRef.current.getBoundingClientRect()
    const rawX = ((e.clientX - rect.left) / rect.width) * 100
    const rawY = ((e.clientY - rect.top) / rect.height) * 100
    const clampedX = Math.max(0, Math.min(100, Math.round(rawX)))
    const clampedY = Math.max(0, Math.min(100, Math.round(rawY)))
    onChange({ ...focal, x: clampedX, y: clampedY })
  }

  const handleMapPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingMap(true)
    handleMapPointer(e)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handleMapPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingMap) return
    handleMapPointer(e)
  }

  const handleMapPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingMap(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}
  }

  // Phone screen pan/drag handler
  const handlePhonePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingPhone(true)
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: focal.x,
      startY: focal.y,
    }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePhonePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPhone || !phonePreviewRef.current) return
    const deltaX = e.clientX - dragStartRef.current.clientX
    const deltaY = e.clientY - dragStartRef.current.clientY

    // Panning inside phone: moving cursor left shifts focal point right
    const sensitivity = 0.35 / focal.zoom
    const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.startX - deltaX * sensitivity)))
    const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.startY - deltaY * sensitivity)))

    onChange({ ...focal, x: newX, y: newY })
  }

  const handlePhonePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingPhone(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}
  }

  // Nudge buttons
  const nudge = (dx: number, dy: number) => {
    onChange({
      ...focal,
      x: Math.max(0, Math.min(100, focal.x + dx)),
      y: Math.max(0, Math.min(100, focal.y + dy)),
    })
  }

  // Zoom changes
  const handleZoomChange = (newZoom: number) => {
    onChange({
      ...focal,
      zoom: Math.max(1, Math.min(2.5, Number(newZoom.toFixed(2)))),
    })
  }

  // Reset to default
  const handleReset = () => {
    onChange({ x: 50, y: 50, zoom: 1 })
  }

  return (
    <div className="space-y-5">
      {/* Header with status badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Smartphone className="w-4 h-4 text-amber-500" />
          <span>Mobile Banner Frame & Focal Point</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-muted/80 text-muted-foreground px-2.5 py-1 rounded-md border border-border">
            X: {focal.x}% · Y: {focal.y}% · Zoom: {focal.zoom.toFixed(2)}x
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Reset to center and 1.0x zoom"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Phone Live Simulator */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5" />
            <span>Drag image inside screen to pan</span>
          </div>

          {/* Smartphone mockup shell */}
          <div 
            ref={phonePreviewRef}
            onPointerDown={handlePhonePointerDown}
            onPointerMove={handlePhonePointerMove}
            onPointerUp={handlePhonePointerUp}
            onPointerCancel={handlePhonePointerUp}
            className={`relative rounded-[32px] overflow-hidden border-[5px] border-neutral-900 bg-neutral-950 shadow-2xl cursor-grab active:cursor-grabbing select-none transition-shadow ${
              isDraggingPhone ? 'ring-2 ring-amber-500 shadow-amber-500/20' : ''
            }`}
            style={{ width: 180, height: 320 }}
          >
            {/* Top speaker & camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-neutral-900 rounded-full z-20 pointer-events-none flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-950 ml-auto mr-1.5" />
            </div>

            {/* The zoomed + positioned banner image */}
            <img
              src={imageUrl}
              alt="Mobile banner preview"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-75"
              style={{
                objectPosition: `${focal.x}% ${focal.y}%`,
                transform: `scale(${focal.zoom})`,
                transformOrigin: `${focal.x}% ${focal.y}%`,
              }}
            />

            {/* Realistic Scrim overlay preview (matches public page) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(11,9,8,0.92) 0%, rgba(11,9,8,0.35) 45%, transparent 100%)'
              }}
            />

            {/* Mock Header and Tag overlay */}
            <div className="absolute inset-x-3 bottom-3 z-10 pointer-events-none text-left">
              <span className="inline-block text-[8px] font-bold uppercase tracking-wider bg-amber-400 text-neutral-950 px-1.5 py-0.5 rounded-full mb-1">
                Preview
              </span>
              <p className="text-[10px] font-serif font-bold text-neutral-100 line-clamp-1 leading-tight">
                Mobile View
              </p>
            </div>
          </div>
        </div>

        {/* Right: Full Banner Navigator & Controls */}
        <div className="md:col-span-7 space-y-4">
          {/* Navigator Map */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex justify-between">
              <span>Full Banner Navigator (Click or Drag box)</span>
            </div>

            <div
              ref={miniMapRef}
              onPointerDown={handleMapPointerDown}
              onPointerMove={handleMapPointerMove}
              onPointerUp={handleMapPointerUp}
              onPointerCancel={handleMapPointerUp}
              className="relative w-full h-[120px] rounded-xl overflow-hidden border-2 border-border/80 bg-neutral-950 cursor-crosshair select-none group"
            >
              <img
                src={imageUrl}
                alt="Banner navigator"
                className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
              />

              {/* Grid overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                  backgroundSize: '25% 50%'
                }}
              />

              {/* Draggable Viewport Reticle Box */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-amber-400 bg-amber-400/20 backdrop-blur-[1px] rounded-md pointer-events-none shadow-[0_0_12px_rgba(251,191,36,0.6)] flex items-center justify-center transition-all duration-75"
                style={{
                  left: `${focal.x}%`,
                  top: `${focal.y}%`,
                  width: `${Math.max(20, 36 / focal.zoom)}px`,
                  height: `${Math.max(35, 64 / focal.zoom)}px`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
              </div>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2 bg-muted/20 border border-border/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ZoomIn className="w-3.5 h-3.5" />
                Zoom Level
              </span>
              <span className="font-mono text-foreground font-semibold">{focal.zoom.toFixed(2)}x</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-lg"
                onClick={() => handleZoomChange(focal.zoom - 0.1)}
                disabled={focal.zoom <= 1.0}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>

              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={focal.zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-lg"
                onClick={() => handleZoomChange(focal.zoom + 0.1)}
                disabled={focal.zoom >= 2.5}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Precision Nudge Controls */}
          <div className="flex items-center justify-between gap-3 bg-muted/20 border border-border/60 rounded-xl p-3">
            <span className="text-xs text-muted-foreground font-medium">Precision Nudge</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => nudge(-3, 0)}
                title="Nudge Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => nudge(0, -3)}
                  title="Nudge Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => nudge(0, 3)}
                  title="Nudge Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => nudge(3, 0)}
                title="Nudge Right"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroBannerCard({ exhibition }: { exhibition: any }) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const [heroImageUrl, setHeroImageUrl] = React.useState(exhibition.hero_image_url || "")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  
  // Custom continuous focal state (X%, Y%, Zoom)
  const [focalState, setFocalState] = React.useState<FocalState>(() =>
    parseFocalString(exhibition.mobile_image_position)
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

      const formattedPosition = formatFocalString(focalState)

      const res = await updateExhibition(exhibition.id, {
        ...exhibition,
        hero_image_url: finalUrl,
        mobile_image_position: formattedPosition,
      })
      if (res.error) throw new Error(res.error)
      toast.success("Hero banner and mobile crop updated")
      setImageFile(null)
    } catch (err: any) {
      toast.error("Failed to update banner", { description: err.message })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const currentFormatted = formatFocalString(focalState)
  const initialFormatted = exhibition.mobile_image_position || 'center center'

  const hasChanges =
    imageFile !== null ||
    (heroImageUrl !== exhibition.hero_image_url && heroImageUrl === "") ||
    currentFormatted !== initialFormatted

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Banner</CardTitle>
        <CardDescription>
          Upload a high-quality banner for desktop, then drag and zoom to customize exactly how it appears on smartphones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Desktop preview / upload zone ── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Desktop Preview
          </p>
          <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] bg-muted/10 relative">
            {heroImageUrl ? (
              <div className="relative w-full h-[190px]">
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

        {/* ── Mobile focal-point & zoom customizer (only shown when there is an image) ── */}
        {heroImageUrl && (
          <div className="border border-border rounded-xl p-5 bg-muted/5">
            <MobileFocalCustomizer
              imageUrl={heroImageUrl}
              focal={focalState}
              onChange={setFocalState}
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={!hasChanges || isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Banner
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
