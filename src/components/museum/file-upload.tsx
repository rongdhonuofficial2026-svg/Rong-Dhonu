'use client'

import * as React from "react"
import Image from "next/image"
import { UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImagePreviewProps {
  url: string
  onRemove?: () => void
  className?: string
}

export function ImagePreview({ url, onRemove, className }: ImagePreviewProps) {
  return (
    <div className={cn("relative group overflow-hidden rounded-lg border border-border bg-muted", className)}>
      <Image src={url} alt="Preview" fill className="object-cover" />
      {onRemove && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
          <Button variant="destructive" size="sm" onClick={onRemove} className="gap-2">
            <X className="w-4 h-4" /> Remove
          </Button>
        </div>
      )}
    </div>
  )
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  accept?: string
  className?: string
}

export function FileUpload({ onFilesSelected, maxFiles = 1, accept = "image/*", className }: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).slice(0, maxFiles)
      onFilesSelected(filesArray)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(file => file.type.match(accept.replace('*', '.*'))).slice(0, maxFiles)
      if (filesArray.length > 0) {
        onFilesSelected(filesArray)
      }
    }
  }

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer",
        isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent hover:bg-muted/30",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept}
        multiple={maxFiles > 1}
      />
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <UploadCloud className={cn("w-12 h-12", isDragging ? "text-accent" : "opacity-50")} />
        <div>
          <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
          <p className="text-sm mt-1">SVG, PNG, JPG or WEBP (max {maxFiles} file{maxFiles !== 1 && 's'})</p>
        </div>
      </div>
    </div>
  )
}
