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
