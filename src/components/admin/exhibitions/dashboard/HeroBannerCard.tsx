'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateExhibition } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

export function HeroBannerCard({ exhibition }: { exhibition: any }) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  
  const [heroImageUrl, setHeroImageUrl] = React.useState(exhibition.hero_image_url || "")
  const [imageFile, setImageFile] = React.useState<File | null>(null)

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

      const res = await updateExhibition(exhibition.id, { ...exhibition, hero_image_url: finalUrl })
      if (res.error) throw new Error(res.error)
      toast.success("Hero banner updated")
      setImageFile(null) // reset to hide save button if we want, but it's fine
    } catch (err: any) {
      toast.error("Failed to update banner", { description: err.message })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const hasChanges = (imageFile !== null) || (heroImageUrl !== exhibition.hero_image_url && heroImageUrl === "")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Banner</CardTitle>
        <CardDescription>Upload a high-quality banner for the exhibition.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-muted/10 relative">
          {heroImageUrl ? (
            <div className="relative w-full h-[250px]">
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
              <p className="font-medium">Uploading image...</p>
              <div className="w-full max-w-xs h-2 bg-muted mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={!hasChanges || isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Banner
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
