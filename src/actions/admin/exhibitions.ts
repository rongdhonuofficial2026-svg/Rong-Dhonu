'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"

// ─── Permission Helpers ───────────────────────────────────────────────────────

/** Allows admin / committee / owner */
async function requireAdmin(supabase: any, user: any) {
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'committee', 'owner'].includes(profile.role)) throw new Error('Forbidden')
  return profile.role
}

/** Allows ONLY owner — used exclusively for permanent deletion */
async function requireOwner(supabase: any, user: any): Promise<string> {
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'owner') {
    throw new Error('Forbidden: Only owners can permanently delete exhibitions.')
  }
  return profile.role
}

// ─── Cache Revalidation ───────────────────────────────────────────────────────

function revalidateExhibitionCaches(id?: string) {
  const locales = ['en', 'bn']
  locales.forEach(loc => {
    // Admin pages
    revalidatePath(`/${loc}/admin/exhibitions`)
    revalidatePath(`/${loc}/admin/statistics`)
    revalidatePath(`/${loc}/admin/gallery`)
    revalidatePath(`/${loc}/admin/catalogs`)
    if (id) {
      revalidatePath(`/${loc}/admin/exhibitions/${id}`)
      // Public exhibition detail
      revalidatePath(`/${loc}/exhibitions/${id}`)
    }
    // Public listing pages
    revalidatePath(`/${loc}/exhibitions`)
    revalidatePath(`/${loc}/gallery`)
    revalidatePath(`/${loc}/catalogs`)
    revalidatePath(`/${loc}/artists`)
    revalidatePath(`/${loc}/search`)
    revalidatePath(`/${loc}`) // Homepage
  })
  // Cache tags for ISR / React cache
  revalidateTag('featured_exhibition')
  revalidateTag('curated_collection')
  revalidateTag('homepage_stats')
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

  // 4. Handle Featured Status Override
  if (payload.is_featured === true) {
    await supabase.from('exhibitions').update({ is_featured: false }).neq('is_deleted', true)
  }

  // 5. Database Insert
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

  // 4. Handle Featured Status Override
  if (payload.is_featured !== undefined) {
    updateData.is_featured = payload.is_featured === true
    if (updateData.is_featured) {
      await supabase.from('exhibitions').update({ is_featured: false }).neq('id', id)
    }
  }

  // 5. Database Update
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

// ─── Storage Path Utilities ───────────────────────────────────────────────────

/**
 * Parses the relative storage path from a Supabase public URL.
 * e.g. https://xxx.supabase.co/storage/v1/object/public/gallery/exhibitions/abc/hero.jpg
 *      → 'exhibitions/abc/hero.jpg'
 * Returns null for non-storage or empty URLs.
 */
function parseStoragePath(url: string | null | undefined, bucket: string): string | null {
  if (!url || !url.includes('/storage/v1/object/public/')) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const path = url.slice(idx + marker.length)
  return path || null
}

interface StorageFile {
  bucket: string
  path: string
}

/**
 * Collects all storage file references linked to an exhibition, across all buckets.
 * MUST be called before the database row is deleted.
 */
async function collectExhibitionStorageFiles(supabase: any, exhibitionId: string): Promise<StorageFile[]> {
  const files: StorageFile[] = []

  const push = (bucket: string, url: string | null | undefined) => {
    const path = parseStoragePath(url, bucket)
    if (path) files.push({ bucket, path })
  }

  // 1. Exhibition hero image
  const { data: exh } = await supabase
    .from('exhibitions')
    .select('hero_image_url')
    .eq('id', exhibitionId)
    .maybeSingle()
  if (exh) push('gallery', exh.hero_image_url)

  // 2. Gallery media for this exhibition
  const { data: mediaItems } = await supabase
    .from('gallery_media')
    .select('url, thumbnail_url')
    .eq('exhibition_id', exhibitionId)
  for (const m of mediaItems || []) {
    push('gallery', m.url)
    push('gallery', m.thumbnail_url)
  }

  // 3. Gallery albums og_image_url
  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('og_image_url')
    .eq('exhibition_id', exhibitionId)
  for (const a of albums || []) {
    push('gallery', a.og_image_url)
  }

  // 4. Artwork images (raw + optimized)
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id')
    .eq('exhibition_id', exhibitionId)
  const artworkIds = (artworks || []).map((a: any) => a.id)

  if (artworkIds.length > 0) {
    const { data: artworkImages } = await supabase
      .from('artwork_images')
      .select('url_thumbnail, url_medium, url_high, url_zoom')
      .in('artwork_id', artworkIds)
    for (const img of artworkImages || []) {
      push('artworks_optimized', img.url_thumbnail)
      push('artworks_optimized', img.url_medium)
      push('artworks_optimized', img.url_high)
      push('artworks_optimized', img.url_zoom)
    }

    // Also check for raw artwork URLs directly on artworks table
    const { data: artworkRaw } = await supabase
      .from('artworks')
      .select('image_url')
      .eq('exhibition_id', exhibitionId)
    for (const a of artworkRaw || []) {
      push('artworks_raw', a.image_url)
      push('artworks_optimized', a.image_url)
    }
  }

  // 5. Catalogs
  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('pdf_url, cover_image_url')
    .eq('exhibition_id', exhibitionId)
  for (const c of catalogs || []) {
    push('catalogs', c.pdf_url)
    push('gallery', c.cover_image_url)
  }

  // De-duplicate by bucket+path
  const seen = new Set<string>()
  return files.filter(f => {
    const key = `${f.bucket}::${f.path}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Attempts to remove a list of storage files grouped by bucket.
 * Returns separate lists of succeeded and failed paths.
 */
async function cleanupStorageFiles(
  supabase: any,
  files: StorageFile[]
): Promise<{ succeeded: StorageFile[]; failed: Array<StorageFile & { error: string }> }> {
  const succeeded: StorageFile[] = []
  const failed: Array<StorageFile & { error: string }> = []

  // Group by bucket
  const byBucket: Record<string, string[]> = {}
  for (const f of files) {
    if (!byBucket[f.bucket]) byBucket[f.bucket] = []
    byBucket[f.bucket].push(f.path)
  }

  for (const [bucket, paths] of Object.entries(byBucket)) {
    if (paths.length === 0) continue
    // Supabase storage.remove() returns data with errors per-file or a top-level error
    const { error } = await supabase.storage.from(bucket).remove(paths)
    if (error) {
      // Mark all paths in this bucket as failed
      for (const path of paths) {
        failed.push({ bucket, path, error: error.message })
      }
    } else {
      for (const path of paths) {
        succeeded.push({ bucket, path })
      }
    }
  }

  return { succeeded, failed }
}

// ─── Post-Deletion Summary Type ───────────────────────────────────────────────

export interface DeletionReport {
  exhibitionId: string
  exhibitionName: string
  artworksRemoved: number
  galleryMediaRemoved: number
  catalogsRemoved: number
  participantsRemoved: number
  storageFilesRemoved: number
  storageFilesQueuedForRetry: number
  homepageRefreshed: boolean
  searchRefreshed: boolean
  statisticsRefreshed: boolean
  verificationPassed: boolean
  warnings: string[]
}

// ─── Permanent Delete (Single) ────────────────────────────────────────────────

export async function permanentDeleteExhibition(
  id: string
): Promise<{ success?: boolean; error?: string; report?: DeletionReport }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let actorRole: string
  try {
    actorRole = await requireOwner(supabase, user)
  } catch (e: any) {
    return { error: e.message }
  }

  // ── Phase 0: Pre-flight fetch ────────────────────────────────────────────
  const { data: exhibition, error: fetchError } = await supabase
    .from('exhibitions')
    .select('id, theme_en, is_deleted, is_featured, status, approved_artists_count')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) return { error: `Failed to fetch exhibition: ${fetchError.message}` }
  if (!exhibition) return { error: 'Exhibition not found.' }
  if (!exhibition.is_deleted) {
    return { error: 'Only exhibitions in the Trash can be permanently deleted. Move the exhibition to Trash first.' }
  }

  const exhibitionName = exhibition.theme_en || id
  const warnings: string[] = []

  // ── Phase 1: Count dependent records (for the report) ───────────────────
  const [artworksRes, participantsRes, galleryRes, catalogsRes] = await Promise.all([
    supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('exhibition_participants').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('gallery_media').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('catalogs').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
  ])

  const artworksCount = artworksRes.count ?? 0
  const participantsCount = participantsRes.count ?? 0
  const galleryCount = galleryRes.count ?? 0
  const catalogsCount = catalogsRes.count ?? 0

  // ── Phase 2: Collect storage file paths (before DB deletion) ────────────
  const storageFiles = await collectExhibitionStorageFiles(supabase, id)

  // ── Phase 3: Audit — STARTED ─────────────────────────────────────────────
  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'PERMANENT_DELETE_STARTED',
    entity_type: 'exhibition',
    entity_id: id,
    details: {
      theme_en: exhibitionName,
      deleted_by_role: actorRole,
      artworks_count: artworksCount,
      participants_count: participantsCount,
      gallery_count: galleryCount,
      catalogs_count: catalogsCount,
      storage_files_identified: storageFiles.length,
    }
  }])

  // ── Phase 4: Atomic database delete (CASCADE handles all children) ───────
  const { error: deleteError } = await supabase
    .from('exhibitions')
    .delete()
    .eq('id', id)

  if (deleteError) {
    // Audit FAILED
    await supabase.from('audit_logs').insert([{
      actor_id: user!.id,
      action: 'PERMANENT_DELETE_FAILED',
      entity_type: 'exhibition',
      entity_id: id,
      details: { theme_en: exhibitionName, reason: deleteError.message }
    }])
    return { error: `Database deletion failed: ${deleteError.message}` }
  }

  // ── Phase 5: Storage cleanup ──────────────────────────────────────────────
  const { succeeded: storageSucceeded, failed: storageFailed } =
    await cleanupStorageFiles(supabase, storageFiles)

  // Queue failed storage deletions for retry
  if (storageFailed.length > 0) {
    const retryRows = storageFailed.map(f => ({
      exhibition_id: id,
      exhibition_name: exhibitionName,
      storage_bucket: f.bucket,
      storage_path: f.path,
      retry_count: 0,
      status: 'pending',
      last_error: f.error,
    }))
    const { error: queueError } = await supabase
      .from('pending_storage_deletions')
      .insert(retryRows)
    if (queueError) {
      warnings.push(`Storage retry queue insert failed: ${queueError.message}. ${storageFailed.length} file(s) may need manual cleanup.`)
      console.error('[permanentDeleteExhibition] Failed to queue storage retries:', queueError.message)
    } else {
      warnings.push(`${storageFailed.length} storage file(s) could not be deleted and have been queued for retry.`)
    }
  }

  // ── Phase 6: Post-deletion verification ──────────────────────────────────
  let verificationPassed = true

  const { data: checkExhibition } = await supabase
    .from('exhibitions')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (checkExhibition) {
    verificationPassed = false
    warnings.push('CRITICAL: Exhibition record still exists after deletion. Database may be in an inconsistent state.')
    console.error('[permanentDeleteExhibition] VERIFICATION FAILED: Exhibition still exists:', id)
  }

  // Check for orphaned artworks (should never happen with CASCADE, but we verify)
  const { count: orphanArtworks } = await supabase
    .from('artworks')
    .select('id', { count: 'exact', head: true })
    .eq('exhibition_id', id)

  if (orphanArtworks && orphanArtworks > 0) {
    verificationPassed = false
    warnings.push(`CRITICAL: ${orphanArtworks} orphaned artwork record(s) remain after deletion.`)
    console.error('[permanentDeleteExhibition] ORPHAN ARTWORKS DETECTED:', orphanArtworks)
  }

  // ── Phase 7: Full cache revalidation ─────────────────────────────────────
  revalidateExhibitionCaches(id)

  // ── Phase 8: Audit — COMPLETED ───────────────────────────────────────────
  const report: DeletionReport = {
    exhibitionId: id,
    exhibitionName,
    artworksRemoved: artworksCount,
    galleryMediaRemoved: galleryCount,
    catalogsRemoved: catalogsCount,
    participantsRemoved: participantsCount,
    storageFilesRemoved: storageSucceeded.length,
    storageFilesQueuedForRetry: storageFailed.length,
    homepageRefreshed: true,
    searchRefreshed: true,
    statisticsRefreshed: true,
    verificationPassed,
    warnings,
  }

  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'PERMANENT_DELETE_COMPLETED',
    entity_type: 'exhibition',
    entity_id: id,
    details: {
      theme_en: exhibitionName,
      deleted_by_role: actorRole,
      artworks_removed: artworksCount,
      gallery_media_removed: galleryCount,
      catalogs_removed: catalogsCount,
      participants_removed: participantsCount,
      storage_files_removed: storageSucceeded.length,
      storage_files_queued: storageFailed.length,
      verification_passed: verificationPassed,
      warnings,
    }
  }])

  return { success: true, report }
}

// ─── Permanent Delete (Bulk) ──────────────────────────────────────────────────

export interface BulkDeletionResult {
  succeeded: Array<{ id: string; name: string; report: DeletionReport }>
  failed: Array<{ id: string; name: string; error: string }>
}

export async function bulkPermanentDeleteExhibitions(
  ids: string[]
): Promise<{ success?: boolean; error?: string; result?: BulkDeletionResult }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    await requireOwner(supabase, user)
  } catch (e: any) {
    return { error: e.message }
  }

  if (!ids || ids.length === 0) return { error: 'No exhibition IDs provided.' }
  if (ids.length > 20) {
    return { error: `Safety cap exceeded: cannot permanently delete more than 20 exhibitions at once (received ${ids.length}). Split the request into smaller batches.` }
  }

  const result: BulkDeletionResult = { succeeded: [], failed: [] }

  for (const id of ids) {
    const res = await permanentDeleteExhibition(id)
    if (res.error) {
      // Fetch name for error report (may not exist if ID is wrong)
      const { data: exh } = await supabase
        .from('exhibitions')
        .select('theme_en')
        .eq('id', id)
        .maybeSingle()
      result.failed.push({ id, name: exh?.theme_en ?? id, error: res.error })
    } else if (res.report) {
      result.succeeded.push({ id, name: res.report.exhibitionName, report: res.report })
    }
  }

  return { success: true, result }
}

// ─── Storage Retry ────────────────────────────────────────────────────────────

export interface StorageRetryResult {
  totalAttempted: number
  succeeded: number
  failed: number
  details: Array<{ id: string; bucket: string; path: string; status: 'success' | 'failed'; error?: string }>
}

export async function retryStorageCleanup(): Promise<{ success?: boolean; error?: string; result?: StorageRetryResult }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    await requireOwner(supabase, user)
  } catch (e: any) {
    return { error: e.message }
  }

  // Fetch all pending or failed items (up to 100 at a time)
  const { data: pendingItems, error: fetchError } = await supabase
    .from('pending_storage_deletions')
    .select('id, exhibition_id, exhibition_name, storage_bucket, storage_path, retry_count')
    .in('status', ['pending', 'failed'])
    .order('created_at', { ascending: true })
    .limit(100)

  if (fetchError) return { error: `Failed to fetch retry queue: ${fetchError.message}` }
  if (!pendingItems || pendingItems.length === 0) {
    return { success: true, result: { totalAttempted: 0, succeeded: 0, failed: 0, details: [] } }
  }

  const details: StorageRetryResult['details'] = []

  for (const item of pendingItems) {
    const { error: removeError } = await supabase
      .storage
      .from(item.storage_bucket)
      .remove([item.storage_path])

    const now = new Date().toISOString()

    if (!removeError) {
      await supabase
        .from('pending_storage_deletions')
        .update({
          status: 'success',
          last_retried_at: now,
          retry_count: item.retry_count + 1,
          last_error: null,
        })
        .eq('id', item.id)

      details.push({ id: item.id, bucket: item.storage_bucket, path: item.storage_path, status: 'success' })
    } else {
      await supabase
        .from('pending_storage_deletions')
        .update({
          status: 'failed',
          last_retried_at: now,
          retry_count: item.retry_count + 1,
          last_error: removeError.message,
        })
        .eq('id', item.id)

      details.push({
        id: item.id,
        bucket: item.storage_bucket,
        path: item.storage_path,
        status: 'failed',
        error: removeError.message,
      })
    }
  }

  const succeeded = details.filter(d => d.status === 'success').length
  const failed = details.filter(d => d.status === 'failed').length

  // Audit the retry run
  await supabase.from('audit_logs').insert([{
    actor_id: user!.id,
    action: 'STORAGE_RETRY_CLEANUP',
    entity_type: 'storage',
    entity_id: user!.id,
    details: { total: pendingItems.length, succeeded, failed }
  }])

  return {
    success: true,
    result: { totalAttempted: pendingItems.length, succeeded, failed, details }
  }
}
