'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GalleryMediaUpdate, GalleryMediaInsert } from '@/types/gallery'
import { logAudit } from '@/lib/audit'

export async function createGalleryMediaRecord(data: GalleryMediaInsert) {
  const supabase = await createClient()
  
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: record, error } = await supabase
    .from('gallery_media')
    .insert({
      ...data,
      uploaded_by: user.user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Create media error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('upload_media', 'gallery_media', record.id, { 
    filename: data.original_file_name, 
    category: data.category 
  })

  revalidatePath('/admin/gallery')
  return { success: true, data: record }
}

export async function updateGalleryMedia(id: string, updates: GalleryMediaUpdate) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('gallery_media')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Update media error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('update_media', 'gallery_media', id, updates)

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true }
}

export async function deleteGalleryMedia(id: string, storageUrl: string) {
  const supabase = await createClient()

  // Extract path from public URL
  // Example: https://.../storage/v1/object/public/gallery/path/to/file.jpg
  try {
    const urlObj = new URL(storageUrl)
    const pathParts = urlObj.pathname.split('/gallery/')
    if (pathParts.length === 2) {
      const filePath = pathParts[1]
      // Delete from storage
      const { error: storageError } = await supabase.storage.from('gallery').remove([filePath])
      if (storageError) console.error('Storage deletion error:', storageError)
    }
  } catch (e) {
    console.error('Failed to parse storage URL', e)
  }

  // Delete from DB
  const { error } = await supabase.from('gallery_media').delete().eq('id', id)

  if (error) {
    console.error('Delete media error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('delete_media', 'gallery_media', id, { storageUrl })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true }
}

export async function bulkUpdateGalleryStatus(ids: string[], status: 'draft' | 'published' | 'archived') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('gallery_media')
    .update({ status })
    .in('id', ids)

  if (error) {
    console.error('Bulk update error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('bulk_update_media', 'gallery_media', 'bulk', { count: ids.length, status })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true }
}

export async function bulkDeleteGalleryMedia(items: { id: string, url: string }[]) {
  const supabase = await createClient()
  const pathsToDelete: string[] = []
  
  for (const item of items) {
    try {
      const urlObj = new URL(item.url)
      const pathParts = urlObj.pathname.split('/gallery/')
      if (pathParts.length === 2) {
        pathsToDelete.push(pathParts[1])
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage.from('gallery').remove(pathsToDelete)
    if (storageError) console.error('Bulk storage deletion error:', storageError)
  }

  const { error } = await supabase
    .from('gallery_media')
    .delete()
    .in('id', items.map(i => i.id))

  if (error) {
    console.error('Bulk delete error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('bulk_delete_media', 'gallery_media', 'bulk', { count: items.length })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true }
}

export async function createGalleryMedia(formData: FormData) {
  const supabase = await createClient()

  // 1. Authorization check (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized: Not logged in' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner' && profile.role !== 'committee')) {
    return { success: false, error: 'Unauthorized: Insufficient permissions' }
  }

  // 2. Extract inputs
  const title_en = formData.get('title_en') as string
  const title_bn = formData.get('title_bn') as string
  const description_en = formData.get('description_en') as string
  const description_bn = formData.get('description_bn') as string
  const alt_text = formData.get('alt_text') as string
  const photographer = formData.get('photographer') as string
  const videographer = formData.get('videographer') as string
  const copyright = formData.get('copyright') as string
  const category = formData.get('category') as string
  const exhibition_id_raw = formData.get('exhibition_id') as string
  const visibility = formData.get('visibility') as 'public' | 'hidden'
  const is_featured = formData.get('is_featured') === 'true'
  const file = formData.get('file') as File

  const exhibition_id = exhibition_id_raw && exhibition_id_raw !== 'none' ? exhibition_id_raw : null

  // 3. Validations
  if (!title_en || !title_en.trim()) {
    return { success: false, error: 'English Title is required' }
  }

  if (!category) {
    return { success: false, error: 'Gallery Category is required' }
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Media file is required' }
  }

  // Validate Category exists in DB
  const { data: categoryRow } = await supabase
    .from('gallery_categories')
    .select('id')
    .eq('slug', category)
    .maybeSingle()

  if (!categoryRow) {
    return { success: false, error: `Invalid category: ${category}` }
  }

  // Validate Exhibition if provided
  if (exhibition_id) {
    const { data: exRow } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('id', exhibition_id)
      .maybeSingle()

    if (!exRow) {
      return { success: false, error: 'Associated exhibition not found' }
    }
  }

  // Detect Media Type & Mime
  const mime = file.type
  const isImage = mime.startsWith('image/')
  const isVideo = mime.startsWith('video/')
  
  if (!isImage && !isVideo) {
    return { success: false, error: 'Unsupported file type. Only images and videos are supported.' }
  }

  const media_type = isImage ? 'image' : 'video'

  // Validate file extensions and size limits
  const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
  if (media_type === 'image') {
    const allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'avif']
    if (!allowedImageExts.includes(fileExt)) {
      return { success: false, error: `Unsupported image format: .${fileExt}. Allowed formats: ${allowedImageExts.join(', ')}` }
    }
    // 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      return { success: false, error: 'Image size exceeds maximum limit of 20MB' }
    }
  } else {
    const allowedVideoExts = ['mp4', 'mov', 'webm']
    if (!allowedVideoExts.includes(fileExt)) {
      return { success: false, error: `Unsupported video format: .${fileExt}. Allowed formats: ${allowedVideoExts.join(', ')}` }
    }
    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      return { success: false, error: 'Video size exceeds maximum limit of 500MB' }
    }
  }

  // 4. Upload to Storage
  const folder = media_type === 'image' ? 'images' : 'videos'
  const uniqueName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const storagePath = `${folder}/${uniqueName}`

  let publicUrl = ''
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(storagePath, fileBuffer, {
        contentType: mime,
        cacheControl: '31536000',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(storagePath)
    publicUrl = publicUrlData.publicUrl
  } catch (storageErr: any) {
    console.error('Storage upload error:', storageErr)
    return { success: false, error: storageErr.message || 'File upload failed' }
  }

  // 5. Insert Database Row
  const { data: record, error: dbError } = await supabase
    .from('gallery_media')
    .insert({
      url: publicUrl,
      media_type,
      category,
      title_en,
      title_bn: title_bn || null,
      caption_en: title_en, // populate caption for legacy compatibility
      caption_bn: title_bn || null,
      description_en: description_en || null,
      description_bn: description_bn || null,
      alt_text: alt_text || null,
      photographer: photographer || null,
      videographer: videographer || null,
      copyright: copyright || null,
      visibility: visibility || 'public',
      is_featured,
      exhibition_id,
      uploaded_by: user.id,
      status: visibility === 'public' ? 'published' : 'draft', // maps public/hidden to published/draft
      original_file_name: file.name,
      mime_type: mime,
      size_bytes: file.size
    })
    .select()
    .single()

  if (dbError) {
    console.error('Database insertion error, rolling back storage upload:', dbError)
    // Rollback storage upload
    await supabase.storage.from('gallery').remove([storagePath])
    return { success: false, error: `Database insert failed: ${dbError.message}` }
  }

  // 6. Audit Logging
  await logAudit('upload_media', 'gallery_media', record.id, {
    title_en,
    category,
    media_type,
    exhibition_id,
    visibility
  })

  // 7. Cache Invalidation
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  if (exhibition_id) {
    revalidatePath(`/exhibitions/${exhibition_id}`)
    revalidatePath(`/gallery/${exhibition_id}`)
  }

  return { success: true, data: record }
}

