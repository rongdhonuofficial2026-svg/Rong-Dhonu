'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit'
import { Database } from '@/types/database'

type CatalogInsert = Database['public']['Tables']['catalogs']['Insert']
type CatalogUpdate = Database['public']['Tables']['catalogs']['Update']

export async function createCatalog(data: CatalogInsert) {
  const supabase = await createClient()
  
  if (data.status === 'published' && data.exhibition_id) {
    await unpublishOtherCatalogs(supabase, data.exhibition_id, data.language || 'bilingual')
  }

  const { data: newCatalog, error } = await supabase.from('catalogs').insert(data).select().single()
  
  if (error) {
    console.error('Create Catalog Error:', error)
    return { error: error.message }
  }

  await logAudit('create_catalog', 'catalog', newCatalog.id, data)
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/exhibitions', 'layout')
  
  return { data: newCatalog }
}

export async function updateCatalog(id: string, data: CatalogUpdate) {
  const supabase = await createClient()

  if (data.status === 'published' && data.exhibition_id) {
    // If updating to published, unpublish others
    await unpublishOtherCatalogs(supabase, data.exhibition_id, data.language || 'bilingual', id)
  }

  const { data: updatedCatalog, error } = await supabase.from('catalogs').update(data).eq('id', id).select().single()

  if (error) {
    console.error('Update Catalog Error:', error)
    return { error: error.message }
  }

  await logAudit('update_catalog', 'catalog', id, data)
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/exhibitions', 'layout')
  
  return { data: updatedCatalog }
}

export async function deleteCatalog(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('catalogs').delete().eq('id', id)
  
  if (error) {
    return { error: error.message }
  }

  await logAudit('delete_catalog', 'catalog', id)
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  
  return { success: true }
}

async function unpublishOtherCatalogs(supabase: any, exhibitionId: string, language: string, excludeId?: string) {
  let query = supabase.from('catalogs').update({ status: 'archived' })
    .eq('exhibition_id', exhibitionId)
    .eq('language', language)
    .eq('status', 'published')
    
  if (excludeId) {
    query = query.neq('id', excludeId)
  }
  
  await query
}
