'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { UploadCloud, X, FileImage, FileVideo, CheckCircle2, AlertCircle, Loader2, Pause, Play, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createGalleryMediaRecord } from '@/actions/gallery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UploadProgress, GalleryCategory } from '@/types/gallery'
import type { Database } from '@/types/database'
import * as tus from 'tus-js-client'

interface GalleryUploaderProps {
  onUploadComplete?: () => void
  exhibitionId?: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_CONCURRENT_UPLOADS = 3

export function GalleryUploader({ onUploadComplete, exhibitionId }: GalleryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const tusUploadsRef = useRef<Map<string, tus.Upload>>(new Map())
  const supabase = createClient()

  // Concurrency check effect
  const activeUploadsCount = uploads.filter(u => u.status === 'uploading').length

  useEffect(() => {
    const pendingUploads = uploads.filter(u => u.status === 'pending')
    if (pendingUploads.length > 0 && activeUploadsCount < MAX_CONCURRENT_UPLOADS) {
      const slotsAvailable = MAX_CONCURRENT_UPLOADS - activeUploadsCount
      const toStart = pendingUploads.slice(0, slotsAvailable)
      toStart.forEach(u => startTusUpload(u.id, u.file))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads, activeUploadsCount])

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
      previewUrl: URL.createObjectURL(file),
      category: 'album_media'
    }))

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
    // reset input
    e.target.value = ''
  }

  // Category update removed, using fixed category 'album_media'

  const startTusUpload = async (uploadId: string, file: File) => {
    setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'uploading' } : u))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      const datePath = new Date().toISOString().split('T')[0].replace(/-/g, '/')
      const path = `uploads/${datePath}/${fileName}`

      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: 'gallery',
          objectName: path,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024,
        onError: function (error) {
          console.error("Tus upload failed:", error)
          setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error', error: error.message || 'Upload failed' } : u))
          tusUploadsRef.current.delete(uploadId)
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = (bytesUploaded / bytesTotal) * 100
          setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress: percentage } : u))
        },
        onSuccess: async function () {
          try {
            const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(path)
            const isVideo = file.type.startsWith('video/')
            const currentUpload = uploads.find(u => u.id === uploadId)
            
            const dbResult = await createGalleryMediaRecord({
              url: publicUrlData.publicUrl,
              category: 'album_media',
              exhibition_id: exhibitionId,
              media_type: isVideo ? 'video' : 'image',
              mime_type: file.type,
              original_file_name: file.name,
              size_bytes: file.size,
              caption_en: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
              status: 'published'
            })

            if (!dbResult.success) {
              console.warn('DB insert failed, rolling back storage object:', path)
              await supabase.storage.from('gallery').remove([path])
              throw new Error(dbResult.error)
            }

            setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'success', progress: 100 } : u))
            tusUploadsRef.current.delete(uploadId)
            
            setTimeout(() => {
              setUploads(current => {
                const allDone = current.every(u => u.status === 'success' || u.status === 'error' || u.status === 'paused')
                const anyPending = current.some(u => u.status === 'pending' || u.status === 'uploading')
                if (allDone && !anyPending && onUploadComplete) onUploadComplete()
                return current
              })
            }, 1000)
            
          } catch (dbErr: any) {
             setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error', error: dbErr.message || 'DB save failed' } : u))
          }
        }
      })

      tusUploadsRef.current.set(uploadId, upload)
      upload.start()

    } catch (err: any) {
      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error', error: err.message || 'Initialization failed' } : u))
    }
  }

  const togglePauseResume = (id: string) => {
    const uploadInst = tusUploadsRef.current.get(id)
    const targetState = uploads.find(u => u.id === id)
    
    if (targetState?.status === 'uploading' && uploadInst) {
      uploadInst.abort()
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'paused' } : u))
    } else if (targetState?.status === 'paused' && uploadInst) {
      uploadInst.start()
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'uploading' } : u))
    }
  }

  const removeUpload = (id: string) => {
    const uploadInst = tusUploadsRef.current.get(id)
    if (uploadInst) {
      uploadInst.abort()
      tusUploadsRef.current.delete(id)
    }
    setUploads(prev => {
      const target = prev.find(u => u.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter(u => u.id !== id)
    })
  }

  const retryUpload = (id: string) => {
    const target = uploads.find(u => u.id === id)
    if (target) {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'pending', error: undefined, progress: 0 } : u))
    }
  }

  const clearAll = () => {
    uploads.forEach(u => {
      if (u.previewUrl) URL.revokeObjectURL(u.previewUrl)
      const inst = tusUploadsRef.current.get(u.id)
      if (inst) inst.abort()
    })
    tusUploadsRef.current.clear()
    setUploads([])
  }

  return (
    <div className="space-y-6">
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
          Upload high-resolution images or videos. Support for JPG, PNG, WEBP, MP4. Max 50MB per file. Resumable uploads enabled.
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

      {uploads.length > 0 && (
        <div className="bg-background/40 backdrop-blur-xl border border-border/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-sm font-semibold text-foreground">Upload Queue ({uploads.length})</h4>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-rose-500" onClick={clearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {uploads.map(upload => (
              <div key={upload.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/30 bg-muted/5 relative overflow-hidden group">
                
                {(upload.status === 'uploading' || upload.status === 'paused') && (
                  <div 
                    className={`absolute inset-0 transition-all duration-300 -z-10 ${upload.status === 'paused' ? 'bg-muted/30' : 'bg-accent/5'}`}
                    style={{ width: `${upload.progress}%` }} 
                  />
                )}

                <div className="shrink-0 w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative border border-border/50">
                  {upload.file.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={upload.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileVideo className="w-5 h-5 text-muted-foreground/60" /></div>
                  )}
                </div>

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
                      ${upload.status === 'paused' ? 'text-amber-500' : ''}
                      ${upload.status === 'pending' ? 'text-muted-foreground' : ''}
                    `}>
                      {upload.status === 'error' ? upload.error : 
                       upload.status === 'uploading' ? `${upload.progress.toFixed(0)}%` : 
                       upload.status}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pr-2">
                  {/* Category select removed for Album workflow */}
                  {upload.status === 'uploading' && (
                    <>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-amber-500" onClick={() => togglePauseResume(upload.id)}>
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    </>
                  )}
                  {upload.status === 'paused' && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-amber-500 hover:text-emerald-500" onClick={() => togglePauseResume(upload.id)}>
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  {upload.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {upload.status === 'error' && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => retryUpload(upload.id)}>
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {upload.status !== 'success' && (
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
