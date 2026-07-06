'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Validate admin helper
async function requireAdmin(supabase: any, user: any) {
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') throw new Error('Forbidden')
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
    status: payload.status || 'draft',
    hero_image_url: payload.hero_image_url
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

  revalidatePath('/[locale]/(admin)/admin/exhibitions', 'page')
  return { success: true, data }
}

export async function updateExhibition(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  const { data, error } = await supabase.from('exhibitions').update({
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
    status: payload.status,
    hero_image_url: payload.hero_image_url
  }).eq('id', id).select().single()

  if (error) return { error: error.message }
  
  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'UPDATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id,
    details: { theme: payload.theme_en }
  }])

  revalidatePath('/[locale]/(admin)/admin/exhibitions', 'page')
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

  const { data, error } = await supabase.from('exhibitions').insert([copyPayload]).select().single()
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'DUPLICATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: data.id,
    details: { original_id: id }
  }])

  revalidatePath('/[locale]/(admin)/admin/exhibitions', 'page')
  return { success: true, data }
}

export async function archiveExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  const { error } = await supabase.from('exhibitions').update({ status: 'archived' }).eq('id', id)
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'ARCHIVE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id
  }])

  revalidatePath('/[locale]/(admin)/admin/exhibitions', 'page')
  return { success: true }
}
