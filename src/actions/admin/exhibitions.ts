'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Validate admin/committee helper
async function requireAdmin(supabase: any, user: any) {
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'committee', 'owner'].includes(profile.role)) throw new Error('Forbidden')
  return profile.role
}

function revalidateExhibitionCaches(id?: string) {
  const locales = ['en', 'bn']
  locales.forEach(loc => {
    revalidatePath(`/${loc}/admin/exhibitions`)
    if (id) {
      revalidatePath(`/${loc}/admin/exhibitions/${id}`)
      revalidatePath(`/${loc}/exhibitions/${id}`)
    }
    revalidatePath(`/${loc}/exhibitions`)
    revalidatePath(`/${loc}`) // Homepage
  })
}

export async function createExhibition(payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // 1. Sanitize optional dates to prevent PostgreSQL type cast crashes (empty string -> null)
  const safeDate = (dateStr: any) => (dateStr && typeof dateStr === 'string' && dateStr.trim() !== '') ? dateStr : null;
  const exhibition_start = safeDate(payload.exhibition_start);
  const exhibition_end = safeDate(payload.exhibition_end);
  const registration_start = safeDate(payload.registration_start);
  const submission_end = safeDate(payload.submission_end);

  if (!exhibition_start || !exhibition_end || !registration_start || !submission_end) {
    return { error: `All 4 timeline dates (Registration Opens, Submission Deadline, Exhibition Opens, Exhibition Closes) are mandatory.` }
  }

  // 2. Derive year from start date (display / ordering only — NOT a uniqueness key)
  const startYear = exhibition_start ? new Date(exhibition_start).getFullYear() : new Date().getFullYear();

  if (isNaN(startYear)) {
    return { error: `Invalid date format provided for Exhibition Opening.` }
  }

  // 3. True Duplicate Check
  //    An exhibition is a duplicate only when BOTH the title (English) AND the
  //    opening date are identical to an existing non-deleted exhibition.
  //    Multiple exhibitions in the same calendar year are explicitly allowed.
  if (payload.theme_en && exhibition_start) {
    const { data: trueDuplicate } = await supabase
      .from('exhibitions')
      .select('id, theme_en, exhibition_start')
      .ilike('theme_en', payload.theme_en.trim())
      .eq('exhibition_start', exhibition_start)
      .neq('is_deleted', true)
      .maybeSingle()

    if (trueDuplicate) {
      return { error: `An exhibition with the same title and opening date already exists. Please use a distinct title or a different opening date.` }
    }
  }

  // 4. Database Insert
  const { data, error } = await supabase.from('exhibitions').insert([{
    year: startYear,
    theme_en: payload.theme_en,
    theme_bn: payload.theme_bn || '',
    curatorial_statement_en: payload.curatorial_statement_en || null,
    curatorial_statement_bn: payload.curatorial_statement_bn || null,
    description_en: payload.description_en || null,
    description_bn: payload.description_bn || null,
    exhibition_start,
    exhibition_end,
    registration_start,
    submission_end,
    venue_en: payload.venue_en || null,
    venue_bn: payload.venue_bn || null,
    status: 'draft', // Always force new exhibitions to draft
    hero_image_url: payload.hero_image_url || null,
    is_featured: payload.is_featured === true,
    is_deleted: false,
    views_count: 0,
    registration_count: 0,
    approved_artists_count: 0,
    gallery_views_count: 0,
    catalog_downloads_count: 0
  }]).select().single()

  // 5. Explicit Error Handling
  if (error) {
    return { error: `Database Error (${error.code || 'Unknown'}): ${error.message}` }
  }
  
  // 6. Audit Log
  const { error: auditError } = await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'CREATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: data.id,
    details: { theme: payload.theme_en, year: startYear }
  }])
  if (auditError) {
    console.warn("Audit Log Warning:", auditError.message)
  }

  // 7. Cache Revalidation
  revalidateExhibitionCaches(data.id)
  return { success: true, data }
}

export async function updateExhibition(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // 1. Sanitize optional dates to prevent PostgreSQL type cast crashes (empty string -> null)
  const safeDate = (dateStr: any) => (dateStr && typeof dateStr === 'string' && dateStr.trim() !== '') ? dateStr : null;
  const exhibition_start = safeDate(payload.exhibition_start);
  const exhibition_end = safeDate(payload.exhibition_end);
  const registration_start = safeDate(payload.registration_start);
  const submission_end = safeDate(payload.submission_end);

  if (!exhibition_start || !exhibition_end || !registration_start || !submission_end) {
    return { error: `All 4 timeline dates (Registration Opens, Submission Deadline, Exhibition Opens, Exhibition Closes) are mandatory.` }
  }

  // 2. Derive year from start date (display / ordering only — NOT a uniqueness key)
  const startYear = exhibition_start ? new Date(exhibition_start).getFullYear() : new Date().getFullYear();

  if (isNaN(startYear)) {
    return { error: `Invalid date format provided for Exhibition Opening.` }
  }

  // 3. True Duplicate Check (on update, exclude the record being edited)
  //    An exhibition is a duplicate only when BOTH the title (English) AND the
  //    opening date match another non-deleted exhibition that is not this one.
  if (payload.theme_en && exhibition_start) {
    const { data: trueDuplicate } = await supabase
      .from('exhibitions')
      .select('id, theme_en, exhibition_start')
      .ilike('theme_en', payload.theme_en.trim())
      .eq('exhibition_start', exhibition_start)
      .neq('id', id)
      .neq('is_deleted', true)
      .maybeSingle()

    if (trueDuplicate) {
      return { error: `Another exhibition with the same title and opening date already exists. Please use a distinct title or a different opening date.` }
    }
  }

  const updateData: any = {
    year: startYear,
    theme_en: payload.theme_en,
    theme_bn: payload.theme_bn || '',
    curatorial_statement_en: payload.curatorial_statement_en || null,
    curatorial_statement_bn: payload.curatorial_statement_bn || null,
    description_en: payload.description_en || null,
    description_bn: payload.description_bn || null,
    exhibition_start,
    exhibition_end,
    registration_start,
    submission_end,
    venue_en: payload.venue_en || null,
    venue_bn: payload.venue_bn || null,
    hero_image_url: payload.hero_image_url || null
  }

  // 4. Database Update
  const { data, error } = await supabase.from('exhibitions').update(updateData).eq('id', id).select().single()

  // 5. Explicit Error Handling
  if (error) {
    return { error: `Database Error (${error.code || 'Unknown'}): ${error.message}` }
  }
  
  // 6. Audit Log
  const { error: auditError } = await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'UPDATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id,
    details: { theme: payload.theme_en, year: startYear }
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

  // Enforce manual transition ONLY from draft -> upcoming
  if (current.status !== 'draft' || newStatus !== 'upcoming') {
    return { error: 'Transitions other than Draft to Upcoming are automatically date-driven and cannot be manually triggered.' }
  }

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

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: is_featured ? 'FEATURE_EXHIBITION' : 'UNFEATURE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id
  }])

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

  // Create copy — year is inherited from the original (multiple exhibitions per
  // year are explicitly supported). The title suffix ensures it is not a true duplicate.
  const { id: _, created_at, updated_at, ...copyPayload } = original
  copyPayload.theme_en = `${copyPayload.theme_en} (Copy)`
  copyPayload.theme_bn = copyPayload.theme_bn ? `${copyPayload.theme_bn} (কপি)` : ''
  copyPayload.status = 'draft' // Duplicates should always be drafts
  copyPayload.is_featured = false // Never copy feature status
  copyPayload.is_deleted = false
  copyPayload.deleted_at = null
  copyPayload.deleted_by = null
  
  // Reset analytics counts
  copyPayload.views_count = 0
  copyPayload.registration_count = 0
  copyPayload.approved_artists_count = 0
  copyPayload.gallery_views_count = 0
  copyPayload.catalog_downloads_count = 0

  const { data, error } = await supabase.from('exhibitions').insert([copyPayload]).select().single()
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'DUPLICATE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: data.id,
    details: { original_id: id, duplicated_year: copyPayload.year }
  }])

  revalidateExhibitionCaches(data.id)
  return { success: true, data }
}

export async function archiveExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

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

export async function restoreExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  const { error } = await supabase.from('exhibitions').update({ 
    status: 'draft', 
    is_deleted: false, 
    is_featured: false,
    deleted_at: null,
    deleted_by: null
  }).eq('id', id)
  
  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'RESTORE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id
  }])

  revalidateExhibitionCaches(id)
  return { success: true }
}

export async function softDeleteExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // Dependency Check using correct relation 'gallery_media' instead of non-existent 'gallery_albums'
  const [artworksRes, participantsRes, galleriesRes, catalogsRes] = await Promise.all([
    supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('exhibition_participants').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('gallery_media').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('catalogs').select('id', { count: 'exact', head: true }).eq('exhibition_id', id)
  ])

  const depsCount = (artworksRes.count || 0) + (participantsRes.count || 0) + (galleriesRes.count || 0) + (catalogsRes.count || 0)
  
  if (depsCount > 0) {
    return { error: `Cannot delete exhibition because it has ${depsCount} dependencies (artworks, galleries, etc.). Please archive it instead.` }
  }

  const { error } = await supabase.from('exhibitions').update({ 
    is_deleted: true, 
    is_featured: false,
    deleted_at: new Date().toISOString(),
    deleted_by: user!.id
  }).eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'SOFT_DELETE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id
  }])

  revalidateExhibitionCaches(id)
  return { success: true }
}

export async function permanentDeleteExhibition(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await requireAdmin(supabase, user)

  // Only allow permanent delete for items in trash (is_deleted = true)
  const { data: exhibition, error: fetchError } = await supabase.from('exhibitions').select('is_deleted, theme_en').eq('id', id).single()
  if (fetchError || !exhibition) return { error: 'Exhibition not found' }
  if (!exhibition.is_deleted) return { error: 'Only items in the trash can be permanently deleted.' }

  // Check dependencies
  const [artworksRes, participantsRes, galleriesRes, catalogsRes] = await Promise.all([
    supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('exhibition_participants').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('gallery_media').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('catalogs').select('id', { count: 'exact', head: true }).eq('exhibition_id', id)
  ])

  const depsCount = (artworksRes.count || 0) + (participantsRes.count || 0) + (galleriesRes.count || 0) + (catalogsRes.count || 0)
  
  if (depsCount > 0) {
    return { error: `Cannot permanently delete exhibition because it has ${depsCount} dependencies (artworks, galleries, etc.). Please clean up dependencies first.` }
  }

  const { error } = await supabase.from('exhibitions').delete().eq('id', id)
  if (error) return { error: error.message }

  // Log action
  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'PERMANENT_DELETE_EXHIBITION',
    entity_type: 'exhibition',
    entity_id: id,
    details: { theme: exhibition.theme_en }
  }])

  revalidateExhibitionCaches(id)
  return { success: true }
}

