'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GalleryMediaUpdate, GalleryMediaInsert } from '@/types/gallery'
import { logAudit } from '@/lib/audit'

// Helper to slugify album title
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to generate a unique slug in gallery_albums
async function generateUniqueSlug(supabase: any, title: string) {
  const baseSlug = slugify(title) || 'album'
  let slug = baseSlug
  let counter = 1
  while (true) {
    const { data } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// Helper to look up or create an album
async function getOrCreateAlbum(
  supabase: any,
  exhibitionId?: string | null,
  categorySlug?: string | null,
  albumId?: string | null,
  newAlbumTitle?: string | null
) {
  // 1. If explicit albumId is passed, use it
  if (albumId && albumId !== 'none' && albumId !== 'new') {
    const { data: album } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('id', albumId)
      .maybeSingle()
    if (album) return album.id
  }

  // 2. If exhibitionId is provided, find or create the single album for it
  if (exhibitionId && exhibitionId !== 'none') {
    const { data: album } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .maybeSingle()
    if (album) return album.id

    // Fetch exhibition details to name the album
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('theme_en, theme_bn, description_en, description_bn, year')
      .eq('id', exhibitionId)
      .single()

    const title_en = exhibition?.theme_en || `Exhibition ${exhibition?.year || ''}`
    const title_bn = exhibition?.theme_bn || null
    const slug = exhibitionId // slug is the exhibition id

    const { data: created, error } = await supabase
      .from('gallery_albums')
      .insert({
        exhibition_id: exhibitionId,
        album_type: 'exhibition',
        title: title_en,
        title_en,
        title_bn,
        description_en: exhibition?.description_en || null,
        description_bn: exhibition?.description_bn || null,
        slug,
        status: 'published'
      })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to create exhibition album: ${error.message}`)
    return created.id
  }

  // 3. Independent Album: either new title is provided, or we default to category name
  const catSlug = categorySlug || 'artwork'
  let title_en = newAlbumTitle?.trim() || ''
  if (!title_en) {
    // Check if there is already an independent album for this category
    const { data: existing } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('album_type', 'independent')
      .eq('category_slug', catSlug)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (existing) return existing.id

    // Otherwise fetch category name to use as title
    const { data: category } = await supabase
      .from('gallery_categories')
      .select('name_en, name_bn')
      .eq('slug', catSlug)
      .maybeSingle()
    title_en = category?.name_en || 'Independent Album'
  }

  const slug = await generateUniqueSlug(supabase, title_en)
  const { data: category } = await supabase
    .from('gallery_categories')
    .select('name_bn')
    .eq('slug', catSlug)
    .maybeSingle()

  const { data: created, error } = await supabase
    .from('gallery_albums')
    .insert({
      album_type: 'independent',
      title: title_en,
      title_en,
      title_bn: category?.name_bn || null,
      category_slug: catSlug,
      slug,
      status: 'published'
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create independent album: ${error.message}`)
  return created.id
}

export async function createGalleryMediaRecord(data: any) {
  const supabase = await createClient()
  
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const gallery_album_id = await getOrCreateAlbum(
      supabase,
      data.exhibition_id,
      data.category,
      data.gallery_album_id
    )

    const { data: record, error } = await supabase
      .from('gallery_media')
      .insert({
        ...data,
        gallery_album_id,
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

    // Revalidate paths
    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    
    // Fetch album slug to revalidate specific route
    const { data: album } = await supabase
      .from('gallery_albums')
      .select('id, slug, exhibition_id')
      .eq('id', gallery_album_id)
      .single()
      
    if (album) {
      revalidatePath(`/gallery/${album.id}`)
      revalidatePath(`/gallery/${album.slug}`)
      if (album.exhibition_id) {
        revalidatePath(`/exhibitions/${album.exhibition_id}`)
      }
    }

    return { success: true, data: record }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateGalleryMedia(id: string, updates: GalleryMediaUpdate) {
  const supabase = await createClient()

  // 1. Fetch current media to track exhibition changes
  const { data: existing, error: fetchError } = await supabase
    .from('gallery_media')
    .select('gallery_album_id, visibility, status')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: 'Media asset not found' }
  }

  const finalUpdates: any = { ...updates }

  // 2. Map visibility directly to status
  if (updates.visibility) {
    finalUpdates.status = updates.visibility === 'public' ? 'published' : 'draft'
  } else if (updates.status) {
    finalUpdates.visibility = (updates.status === 'published') ? 'public' : 'hidden'
  }

  // 3. Update row in DB
  const { error } = await supabase
    .from('gallery_media')
    .update(finalUpdates)
    .eq('id', id)

  if (error) {
    console.error('Update media error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('update_media', 'gallery_media', id, finalUpdates)

  // 4. Cache Invalidations
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath('/gallery/archive')

  if (existing.gallery_album_id) {
    revalidatePath(`/gallery/${existing.gallery_album_id}`)
  }

  if (finalUpdates.gallery_album_id && finalUpdates.gallery_album_id !== existing.gallery_album_id) {
    revalidatePath(`/gallery/${finalUpdates.gallery_album_id}`)
  }

  return { success: true }
}

export async function deleteGalleryMedia(id: string, storageUrl: string) {
  const supabase = await createClient()

  // 1. Fetch record first to know its gallery_album_id and storage_path
  const { data: existing } = await supabase
    .from('gallery_media')
    .select('gallery_album_id, storage_path')
    .eq('id', id)
    .single()

  // 2. Extract path and delete from storage
  let filePath = existing?.storage_path
  if (!filePath && storageUrl) {
    try {
      const urlObj = new URL(storageUrl)
      const pathParts = urlObj.pathname.split('/gallery/')
      if (pathParts.length === 2) {
        filePath = pathParts[1]
      }
    } catch (e) {
      console.error('Failed to parse storage URL', e)
    }
  }

  if (filePath) {
    const { error: storageError } = await supabase.storage.from('gallery').remove([filePath])
    if (storageError) console.error('Storage deletion error:', storageError)
  }

  // 3. Delete from DB
  const { error } = await supabase.from('gallery_media').delete().eq('id', id)

  if (error) {
    console.error('Delete media error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('delete_media', 'gallery_media', id, { storageUrl })

  // 4. Robust Cache Invalidation
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath('/gallery/archive')
  if (existing?.gallery_album_id) {
    revalidatePath(`/gallery/${existing.gallery_album_id}`)
  }

  return { success: true }
}

export async function bulkUpdateGalleryStatus(ids: string[], status: 'draft' | 'published' | 'archived') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('gallery_media')
    .update({ status, visibility: status === 'published' ? 'public' : 'hidden' })
    .in('id', ids)

  if (error) {
    console.error('Bulk update error:', error)
    return { success: false, error: error.message }
  }

  await logAudit('bulk_update_media', 'gallery_media', 'bulk', { count: ids.length, status })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath('/gallery/archive')
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
  revalidatePath('/gallery/archive')
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
  const gallery_album_id_raw = formData.get('gallery_album_id') as string
  const new_album_title = formData.get('new_album_title') as string
  const exhibition_association = formData.get('exhibition_association') as 'associate' | 'independent'
  const visibility = formData.get('visibility') as 'public' | 'hidden'
  const is_featured = formData.get('is_featured') === 'true'
  const file = formData.get('file') as File

  const exhibition_id = exhibition_association === 'associate' && exhibition_id_raw !== 'none' ? exhibition_id_raw : null
  const gallery_album_id_input = exhibition_association === 'independent' && gallery_album_id_raw !== 'none' ? gallery_album_id_raw : null

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

  // Get or create targeted album
  let gallery_album_id = ''
  try {
    gallery_album_id = await getOrCreateAlbum(
      supabase,
      exhibition_id,
      category,
      gallery_album_id_input,
      new_album_title
    )
  } catch (albumErr: any) {
    return { success: false, error: albumErr.message }
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
      gallery_album_id,
      uploaded_by: user.id,
      status: visibility === 'public' ? 'published' : 'draft', // maps public/hidden to published/draft
      original_file_name: file.name,
      mime_type: mime,
      size_bytes: file.size,
      storage_path: storagePath
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
    gallery_album_id,
    visibility
  })

  // 7. Cache Invalidation
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  
  const { data: album } = await supabase
    .from('gallery_albums')
    .select('id, slug, exhibition_id')
    .eq('id', gallery_album_id)
    .single()
    
  if (album) {
    revalidatePath(`/gallery/${gallery_album_id}`)
    revalidatePath(`/gallery/${album.slug}`)
    if (album.exhibition_id) {
      revalidatePath(`/exhibitions/${album.exhibition_id}`)
    }
  }

  return { success: true, data: record }
}

// Album Management Server Actions

export async function createIndependentAlbum(payload: { title_en: string; title_bn?: string; description_en?: string; description_bn?: string; category_slug: string; is_featured?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const slug = await generateUniqueSlug(supabase, payload.title_en)
  const { data, error } = await supabase
    .from('gallery_albums')
    .insert({
      album_type: 'independent',
      title: payload.title_en,
      title_en: payload.title_en,
      title_bn: payload.title_bn || null,
      description_en: payload.description_en || null,
      description_bn: payload.description_bn || null,
      category_slug: payload.category_slug,
      is_featured: payload.is_featured === true,
      slug,
      status: 'published'
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  
  await logAudit('create_album', 'gallery_album', data.id, { title: payload.title_en })
  
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true, data }
}

export async function updateGalleryAlbum(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const updates: any = {
    title: payload.title_en || payload.title || '',
    title_en: payload.title_en || payload.title || '',
    title_bn: payload.title_bn || null,
    description_en: payload.description_en || null,
    description_bn: payload.description_bn || null,
    category_slug: payload.category_slug || null,
    is_featured: payload.is_featured === true,
    status: payload.status || 'published',
    seo_title: payload.seo_title || null,
    seo_description: payload.seo_description || null,
    og_image_url: payload.og_image_url || null,
    cover_media_id: payload.cover_media_id || null,
    updated_at: new Date().toISOString()
  }

  // If title changed and it is an independent album, we can update the slug
  const { data: existing } = await supabase.from('gallery_albums').select('album_type, slug').eq('id', id).single()
  if (existing && existing.album_type === 'independent' && payload.title_en && payload.title_en !== existing.slug) {
    updates.slug = await generateUniqueSlug(supabase, payload.title_en)
  }

  const { data, error } = await supabase
    .from('gallery_albums')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logAudit('update_album', 'gallery_album', id, updates)

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath(`/gallery/${id}`)
  if (data.slug) {
    revalidatePath(`/gallery/${data.slug}`)
  }
  if (data.exhibition_id) {
    revalidatePath(`/exhibitions/${data.exhibition_id}`)
  }

  return { success: true, data }
}

export async function deleteGalleryAlbum(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Fetch all media in this album to delete files from storage
  const { data: mediaItems } = await supabase
    .from('gallery_media')
    .select('id, url, storage_path')
    .eq('gallery_album_id', id)

  if (mediaItems && mediaItems.length > 0) {
    const paths = mediaItems.map(m => m.storage_path).filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabase.storage.from('gallery').remove(paths)
    }
  }

  const { error } = await supabase.from('gallery_albums').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  await logAudit('delete_album', 'gallery_album', id, {})

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  
  return { success: true }
}

// Bulk Media Management Actions

export async function bulkMoveGalleryMediaToAlbum(ids: string[], albumId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('gallery_media')
    .update({ gallery_album_id: albumId })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  await logAudit('bulk_move_media', 'gallery_media', 'bulk', { count: ids.length, target_album_id: albumId })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath(`/gallery/${albumId}`)

  return { success: true }
}

export async function bulkChangeGalleryMediaCategory(ids: string[], category: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('gallery_media')
    .update({ category })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  await logAudit('bulk_change_category', 'gallery_media', 'bulk', { count: ids.length, category })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')

  return { success: true }
}

export async function bulkFeatureGalleryMedia(ids: string[], isFeatured: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('gallery_media')
    .update({ is_featured: isFeatured, featured: isFeatured })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  await logAudit('bulk_feature_media', 'gallery_media', 'bulk', { count: ids.length, isFeatured })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')

  return { success: true }
}
