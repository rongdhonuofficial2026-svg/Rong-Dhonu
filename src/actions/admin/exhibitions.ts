'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Validate admin helper
async function requireAdmin(supabase: any, user: any) {
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'curator', 'owner'].includes(profile.role)) throw new Error('Forbidden')
  return profile.role
}

function revalidateExhibitionCaches(id?: string) {
  revalidatePath('/[locale]/(admin)/admin/exhibitions', 'page')
  if (id) {
    revalidatePath(`/[locale]/(admin)/admin/exhibitions/${id}`, 'page')
    revalidatePath(`/[locale]/(public)/exhibitions/${id}`, 'page')
  }
  revalidatePath('/[locale]/(public)/exhibitions', 'page')
  revalidatePath('/[locale]', 'page') // Homepage
}

export async function createExhibition(payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  const { data, error } = await supabase.from('exhibitions').insert([{
    theme_en: payload.theme_en,
    theme_bn: payload.theme_bn,
    description_en: payload.description_en,
    description_bn: payload.description_bn,
    exhibition_start: payload.exhibition_start,
    exhibition_end: payload.exhibition_end,
    registration_start: payload.registration_start,
    submission_end: payload.submission_end,
    venue_en: payload.venue_en,
    venue_bn: payload.venue_bn,
    status: 'draft', // Always force new exhibitions to draft
    hero_image_url: payload.hero_image_url,
    is_featured: payload.is_featured || false
  }]).select().single()

  if (error) return { error: error.message }
  
  // Log action
  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'CREATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: data.id,
    details: { theme: payload.theme_en }
  }])

  revalidateExhibitionCaches(data.id)
  return { success: true, data }
}

export async function updateExhibition(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  const updateData: any = {
    theme_en: payload.theme_en,
    theme_bn: payload.theme_bn,
    description_en: payload.description_en,
    description_bn: payload.description_bn,
    exhibition_start: payload.exhibition_start,
    exhibition_end: payload.exhibition_end,
    registration_start: payload.registration_start,
    submission_end: payload.submission_end,
    venue_en: payload.venue_en,
    venue_bn: payload.venue_bn,
    hero_image_url: payload.hero_image_url
  }
  
  // Status is only updated via updateExhibitionStatus to enforce lifecycle rules
  // is_featured is only updated via updateExhibitionFeatureStatus

  const { data, error } = await supabase.from('exhibitions').update(updateData).eq('id', id).select().single()

  if (error) return { error: error.message }
  
  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'UPDATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id,
    details: { theme: payload.theme_en }
  }])

  revalidateExhibitionCaches(id)
  return { success: true, data }
}

export async function updateExhibitionStatus(id: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // Fetch current to validate transition
  const { data: current, error: fetchError } = await supabase.from('exhibitions').select('status').eq('id', id).single()
  if (fetchError) return { error: fetchError.message }

  const validStatuses = ['draft', 'upcoming', 'ongoing', 'archived']
  if (!validStatuses.includes(newStatus)) return { error: 'Invalid status' }

  // Simple sequential enforcement (optional strict mode can be added)
  // Current logic just ensures we use valid vocabulary
  
  const { data, error } = await supabase.from('exhibitions').update({ status: newStatus }).eq('id', id).select().single()
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'UPDATE_EXHIBITION_STATUS',
    entity_type: 'exhibition',
    entity_id: id,
    details: { old_status: current.status, new_status: newStatus }
  }])

  revalidateExhibitionCaches(id)
  return { success: true, data }
}

export async function updateExhibitionFeatureStatus(id: string, is_featured: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // If featuring, un-feature all others first
  if (is_featured) {
    await supabase.from('exhibitions').update({ is_featured: false }).neq('id', id)
  }

  const { data, error } = await supabase.from('exhibitions').update({ is_featured }).eq('id', id).select().single()
  if (error) return { error: error.message }

  revalidateExhibitionCaches(id)
  return { success: true, data }
}

export async function duplicateExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // Fetch original
  const { data: original, error: fetchError } = await supabase.from('exhibitions').select('*').eq('id', id).single()
  if (fetchError) return { error: fetchError.message }

  // Create copy
  const { id: _, created_at, updated_at, ...copyPayload } = original
  copyPayload.theme_en = `${copyPayload.theme_en} (Copy)`
  copyPayload.status = 'draft' // Duplicates should always be drafts
  copyPayload.is_featured = false // Never copy feature status

  const { data, error } = await supabase.from('exhibitions').insert([copyPayload]).select().single()
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'DUPLICATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: data.id,
    details: { original_id: id }
  }])

  revalidateExhibitionCaches(data.id)
  return { success: true, data }
}

export async function archiveExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await requireAdmin(supabase, user)
  if (role === 'curator') return { error: 'Curators cannot archive exhibitions' }

  const { error } = await supabase.from('exhibitions').update({ status: 'archived', is_featured: false }).eq('id', id)
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'ARCHIVE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id
  }])

  revalidateExhibitionCaches(id)
  return { success: true }
}
