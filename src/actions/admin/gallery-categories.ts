'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit'
import type { Database } from '@/types/database'

export type GalleryCategoryInsert = Database['public']['Tables']['gallery_categories']['Insert']
export type GalleryCategoryUpdate = Database['public']['Tables']['gallery_categories']['Update']

export async function createGalleryCategory(data: GalleryCategoryInsert) {
  const supabase = await createClient()

  // Verify auth
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { success: false, error: 'Unauthorized' }

  // Generate slug if not provided or empty
  let slug = data.slug
  if (!slug) {
    slug = data.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const { data: record, error } = await supabase
    .from('gallery_categories')
    .insert({ ...data, slug })
    .select()
    .single()

  if (error) {
    console.error('Create category error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true, data: record }
}

export async function updateGalleryCategory(id: string, updates: GalleryCategoryUpdate) {
  const supabase = await createClient()

  // Verify auth
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { success: false, error: 'Unauthorized' }

  const { data: record, error } = await supabase
    .from('gallery_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update category error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true, data: record }
}

export async function deleteGalleryCategory(id: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { success: false, error: 'Unauthorized' }

  // Check if media uses this category slug
  const { data: cat } = await supabase.from('gallery_categories').select('slug').eq('id', id).single()
  if (cat) {
    const { count, error: countErr } = await supabase.from('gallery_media').select('*', { count: 'exact', head: true }).eq('category', cat.slug)
    if (count && count > 0) {
      return { success: false, error: `Cannot delete category. ${count} media items are still using it.` }
    }
  }

  const { error } = await supabase
    .from('gallery_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete category error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true }
}

export async function reorderGalleryCategories(updates: { id: string, sort_order: number }[]) {
  const supabase = await createClient()

  // Verify auth
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { success: false, error: 'Unauthorized' }

  for (const update of updates) {
    const { error } = await supabase
      .from('gallery_categories')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id)
      
    if (error) {
      console.error('Reorder category error:', error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return { success: true }
}
