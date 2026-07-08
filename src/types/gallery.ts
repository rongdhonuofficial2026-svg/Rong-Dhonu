import type { Database } from './database'

export type GalleryMediaRow = Database['public']['Tables']['gallery_media']['Row']
export type GalleryMediaInsert = Database['public']['Tables']['gallery_media']['Insert']
export type GalleryMediaUpdate = Database['public']['Tables']['gallery_media']['Update']

export type GalleryMediaStatus = 'published' | 'draft' | 'archived'

export type GalleryAlbumRow = Database['public']['Tables']['gallery_albums']['Row']
export type GalleryAlbumInsert = Database['public']['Tables']['gallery_albums']['Insert']
export type GalleryAlbumUpdate = Database['public']['Tables']['gallery_albums']['Update']

export interface GalleryMediaWithExhibition extends GalleryMediaRow {
  exhibitions: { theme_en: string; theme_bn: string | null; year: number } | null
  gallery_albums?: GalleryAlbumRow | null
}

export type GalleryCategory = string

export interface UploadProgress {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'paused' | 'success' | 'error'
  error?: string
  previewUrl: string
  category?: string
}
