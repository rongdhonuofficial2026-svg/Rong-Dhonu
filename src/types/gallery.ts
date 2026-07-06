import type { Database } from './database'

export type GalleryMediaRow = Database['public']['Tables']['gallery_media']['Row']
export type GalleryMediaInsert = Database['public']['Tables']['gallery_media']['Insert']
export type GalleryMediaUpdate = Database['public']['Tables']['gallery_media']['Update']

export type GalleryMediaStatus = 'published' | 'draft' | 'archived'

export interface GalleryMediaWithExhibition extends GalleryMediaRow {
  exhibitions: { theme_en: string } | null
}

export const GALLERY_CATEGORIES = [
  'Artwork',
  'Opening Ceremony',
  'Award Ceremony',
  'Exhibition Hall',
  'Artists',
  'Visitors',
  'VIP Guests',
  'Committee',
  'Behind The Scenes',
  'Workshops',
  'Press',
  'Media Coverage',
  'Installation',
  'Closing Ceremony',
  'Promotional',
  'Other'
] as const

export type GalleryCategory = typeof GALLERY_CATEGORIES[number]

export interface UploadProgress {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  previewUrl: string
}
