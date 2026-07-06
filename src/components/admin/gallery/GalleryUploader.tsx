'use client'

import { useState, useCallback } from 'react'
import { UploadCloud, X, FileImage, FileVideo, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createGalleryMediaRecord } from '@/actions/gallery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UploadProgress, GalleryCategory } from '@/types/gallery'

interface GalleryUploaderProps {
  onUploadComplete?: () => void
  defaultCategory?: GalleryCategory
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function GalleryUploader({ onUploadComplete, defaultCategory = 'Artwork' }: GalleryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const supabase = createClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const processFiles = (files: FileList | File[]) => {
    const newUploads: UploadProgress[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending',
      previewUrl: URL.createObjectURL(file)
    }))

    // Validate
    const validated = newUploads.map(u => {
      if (u.file.size > MAX_FILE_SIZE) {
        return { ...u, status: 'error' as const, error: 'File exceeds 50MB limit' }
      }
      if (!u.file.type.startsWith('image/') && !u.file.type.startsWith('video/')) {
        return { ...u, status: 'error' as const, error: 'Unsupported file type' }
      }
      return u
    })

    setUploads(prev => [...prev, ...validated])
    
    // Auto-start valid uploads
    validated.filter(u => u.status === 'pending').forEach(uploadFile)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const uploadFile = async (upload: UploadProgress) => {
    setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'uploading', progress: 10 } : u))
    
    try {
      const ext = upload.file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      const datePath = new Date().toISOString().split('T')[0].replace(/-/g, '/')
      const path = `uploads/${datePath}/${fileName}`

      // 1. Upload to Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('gallery')
        .upload(path, upload.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError

      setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, progress: 50 } : u))

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(path)
      
      // 2. Create DB Record
      const isVideo = upload.file.type.startsWith('video/')
      
      const dbResult = await createGalleryMediaRecord({
        url: publicUrlData.publicUrl,
        category: defaultCategory,
        media_type: isVideo ? 'video' : 'image',
        mime_type: upload.file.type,
        original_file_name: upload.file.name,
        size_bytes: upload.file.size,
        title_en: upload.file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '), // derive title from filename
        status: 'published'
      })

      if (!dbResult.success) {
        // Rollback storage upload if DB insert fails
        console.warn('DB insert failed, rolling back storage object:', path)
        await supabase.storage.from('gallery').remove([path])
        throw new Error(dbResult.error)
      }

      setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'success', progress: 100 } : u))
      
      // Check if all are done
      setTimeout(() => {
        setUploads(current => {
          const allDone = current.every(u => u.status === 'success' || u.status === 'error')
          if (allDone && onUploadComplete) onUploadComplete()
          return current
        })
      }, 1000)

    } catch (err: any) {
      setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'error', error: err.message || 'Upload failed' } : u))
    }
  }

  const removeUpload = (id: string) => {
    setUploads(prev => {
      const target = prev.find(u => u.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter(u => u.id !== id)
    })
  }

  const retryUpload = (id: string) => {
    const target = uploads.find(u => u.id === id)
    if (target) uploadFile({ ...target, status: 'pending', error: undefined })
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[240px]
          ${isDragging 
            ? 'border-accent bg-accent/5' 
            : 'border-border/40 hover:border-accent/50 hover:bg-muted/10 bg-background/50 backdrop-blur-xl'
          }
        `}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'bg-accent/20 scale-110' : 'bg-muted/30'}`}>
          <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-accent' : 'text-muted-foreground'}`} />
        </div>
        
        <h3 className="font-serif text-xl font-medium text-foreground mb-2">
          {isDragging ? 'Drop media files here' : 'Drag & drop media files'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
          Upload high-resolution images or videos. Support for JPG, PNG, WEBP, MP4. Max 50MB per file.
        </p>

        <div className="relative">
          <Input 
            type="file" 
            multiple 
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="outline" className="bg-background border-border/50 hover:bg-muted/20 pointer-events-none">
            Select Files to Upload
          </Button>
        </div>
      </div>

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div className="bg-background/40 backdrop-blur-xl border border-border/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-sm font-semibold text-foreground">Upload Queue ({uploads.length})</h4>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setUploads([])}>
              Clear All
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {uploads.map(upload => (
              <div key={upload.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/30 bg-muted/5 relative overflow-hidden group">
                
                {/* Progress Background */}
                {upload.status === 'uploading' && (
                  <div 
                    className="absolute inset-0 bg-accent/5 transition-all duration-300 -z-10" 
                    style={{ width: `${upload.progress}%` }} 
                  />
                )}

                {/* Preview Thumbnail */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative border border-border/50">
                  {upload.file.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={upload.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileVideo className="w-5 h-5 text-muted-foreground/60" /></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{upload.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground/70 uppercase">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider
                      ${upload.status === 'success' ? 'text-emerald-500' : ''}
                      ${upload.status === 'error' ? 'text-rose-400' : ''}
                      ${upload.status === 'uploading' ? 'text-accent animate-pulse' : ''}
                      ${upload.status === 'pending' ? 'text-muted-foreground' : ''}
                    `}>
                      {upload.status === 'error' ? upload.error : upload.status}
                    </span>
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="shrink-0 flex items-center gap-2 pr-2">
                  {upload.status === 'uploading' && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                  {upload.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {upload.status === 'error' && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => retryUpload(upload.id)}>
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {upload.status !== 'uploading' && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeUpload(upload.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
