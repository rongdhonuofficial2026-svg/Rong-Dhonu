'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit'

// Helper to delete a file from Supabase storage.
// Correctly resolves nested folder paths like covers/filename.jpg
async function deleteStorageFile(supabase: any, url: string | null) {
  if (!url) return
  try {
    const bucketMarker = '/storage/v1/object/public/catalogs/'
    const markerIndex = url.indexOf(bucketMarker)
    if (markerIndex !== -1) {
      // Extracts 'covers/filename.jpg' or 'filename.pdf' correctly
      const storagePath = url.substring(markerIndex + bucketMarker.length)
      if (storagePath) {
        const { error } = await supabase.storage.from('catalogs').remove([storagePath])
        if (error) console.error('[Storage Cleanup] Failed to delete:', storagePath, error.message)
        else console.log('[Storage Cleanup] Deleted:', storagePath)
      }
    } else {
      // Fallback for non-standard URLs
      const fallback = url.split('/').pop()
      if (fallback) await supabase.storage.from('catalogs').remove([fallback])
    }
  } catch (err) {
    console.error('[Storage Cleanup] Unexpected error deleting:', url, err)
  }
}

/**
 * Validates Catalog State transitions according to the explicit state machine:
 * draft -> published
 * published -> archived
 * archived -> draft (unpublish/restore)
 */
function validateStateTransition(oldStatus: string | null, newStatus: string): { valid: boolean; error?: string } {
  if (!oldStatus) return { valid: true } // New record creation
  if (oldStatus === newStatus) return { valid: true }

  if (oldStatus === 'draft' && newStatus === 'published') return { valid: true }
  if (oldStatus === 'published' && newStatus === 'archived') return { valid: true }
  if (oldStatus === 'archived' && newStatus === 'draft') return { valid: true }

  return { 
    valid: false, 
    error: `Invalid transition from state '${oldStatus}' to '${newStatus}'.`
  }
}

export async function createCatalog(data: any) {
  const supabase = await createClient()

  // Verify auth and admin/owner role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner', 'committee'].includes(profile.role)) {
    return { success: false, message: 'Forbidden: Admin access required' }
  }

  // Validate required inputs
  if (!data.exhibition_id) return { success: false, message: 'Exhibition ID is required.' }
  if (!data.title_en?.trim()) return { success: false, message: 'English Title is required.' }
  if (!data.pdf_url?.trim()) return { success: false, message: 'PDF document URL is required.' }
  if (!data.cover_image_url?.trim()) return { success: false, message: 'Cover Image URL is required.' }
  if (!data.version?.trim()) return { success: false, message: 'Version is required.' }
  if (!data.language) return { success: false, message: 'Language is required.' }

  // Version collision check per exhibition
  const { data: existingVersion } = await supabase
    .from('catalogs')
    .select('id')
    .eq('exhibition_id', data.exhibition_id)
    .eq('version', data.version)
    .maybeSingle()

  if (existingVersion) {
    // Failure Recovery: Clean up newly uploaded files if DB insertion fails pre-check
    await deleteStorageFile(supabase, data.pdf_url)
    await deleteStorageFile(supabase, data.cover_image_url)
    return { success: false, message: `Version ${data.version} already exists for this exhibition.` }
  }

  // Determine initial status transitions (all inserts start as draft or published)
  const isPublishing = data.status === 'published'

  let newCatalog
  let dbError

  if (isPublishing) {
    // Insert as draft first, then run publish transaction
    const { data: inserted, error: insertError } = await supabase
      .from('catalogs')
      .insert([
        {
          exhibition_id: data.exhibition_id,
          title_en: data.title_en,
          title_bn: data.title_bn || null,
          description_en: data.description_en || null,
          description_bn: data.description_bn || null,
          pdf_url: data.pdf_url,
          cover_image_url: data.cover_image_url,
          language: data.language,
          version: data.version,
          file_size: data.file_size || null,
          page_count: data.page_count || null,
          status: 'draft',
          visibility: data.visibility || 'public',
          category: data.category || 'exhibition'
        }
      ])
      .select()
      .single()

    if (insertError || !inserted) {
      dbError = insertError
    } else {
      // Transactionally publish and archive others
      const { error: txError } = await supabase.rpc('publish_catalog_transaction', {
        p_catalog_id: inserted.id,
        p_admin_id: user.id
      })

      if (txError) {
        dbError = txError
        // Cleanup the draft catalog record on transactional error
        await supabase.from('catalogs').delete().eq('id', inserted.id)
      } else {
        const { data: fetched } = await supabase
          .from('catalogs')
          .select('*')
          .eq('id', inserted.id)
          .single()
        newCatalog = fetched
      }
    }
  } else {
    // Insert draft catalog record
    const { data: inserted, error: insertError } = await supabase
      .from('catalogs')
      .insert([
        {
          exhibition_id: data.exhibition_id,
          title_en: data.title_en,
          title_bn: data.title_bn || null,
          description_en: data.description_en || null,
          description_bn: data.description_bn || null,
          pdf_url: data.pdf_url,
          cover_image_url: data.cover_image_url,
          language: data.language,
          version: data.version,
          file_size: data.file_size || null,
          page_count: data.page_count || null,
          status: 'draft',
          visibility: data.visibility || 'public',
          category: data.category || 'exhibition'
        }
      ])
      .select()
      .single()

    newCatalog = inserted
    dbError = insertError
  }

  if (dbError || !newCatalog) {
    // Failure Recovery: Clean up uploaded files to prevent orphan storage leaks
    await deleteStorageFile(supabase, data.pdf_url)
    await deleteStorageFile(supabase, data.cover_image_url)
    return { success: false, message: dbError?.message || 'Database insert failed.' }
  }

  // Log audit trail
  await logAudit('create_catalog', 'catalog', newCatalog.id, {
    title: data.title_en,
    exhibition_id: data.exhibition_id,
    version: data.version,
    status: newCatalog.status
  })

  // Targeted cache invalidations — both locales + layout patterns
  const locales = ['en', 'bn']
  locales.forEach(loc => {
    revalidatePath(`/${loc}/admin/catalogs`)
    revalidatePath(`/${loc}/admin/exhibitions/${data.exhibition_id}`)
    revalidatePath(`/${loc}/catalogs`)
    revalidatePath(`/${loc}/exhibitions/${data.exhibition_id}`)
  })
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(admin)/admin/exhibitions/[id]', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/exhibitions', 'layout')

  return { success: true, data: newCatalog }
}

export async function updateCatalog(id: string, data: any) {
  const supabase = await createClient()

  // Verify auth and admin/owner role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner', 'committee'].includes(profile.role)) {
    return { success: false, message: 'Forbidden: Admin access required' }
  }

  // Load current database values for state validations and replacements
  const { data: currentCatalog } = await supabase
    .from('catalogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!currentCatalog) return { success: false, message: 'Catalog record not found.' }

  // Validate state machine transitions
  if (data.status) {
    const transition = validateStateTransition(currentCatalog.status, data.status)
    if (!transition.valid) return { success: false, message: transition.error }
  }

  // Version collision check excluding this current record
  if (data.version && data.version !== currentCatalog.version) {
    const { data: existingVersion } = await supabase
      .from('catalogs')
      .select('id')
      .eq('exhibition_id', currentCatalog.exhibition_id)
      .eq('version', data.version)
      .neq('id', id)
      .maybeSingle()

    if (existingVersion) {
      // Failure Recovery: Clean up newly uploaded replacement files if update fails pre-check
      if (data.pdf_url && data.pdf_url !== currentCatalog.pdf_url) {
        await deleteStorageFile(supabase, data.pdf_url)
      }
      if (data.cover_image_url && data.cover_image_url !== currentCatalog.cover_image_url) {
        await deleteStorageFile(supabase, data.cover_image_url)
      }
      return { success: false, message: `Version ${data.version} already exists for this exhibition.` }
    }
  }

  const isPublishing = data.status === 'published' && currentCatalog.status !== 'published'

  let updatedCatalog
  let dbError

  if (isPublishing) {
    // Transactional publish update
    const { error: txError } = await supabase.rpc('publish_catalog_transaction', {
      p_catalog_id: id,
      p_admin_id: user.id
    })

    if (txError) {
      dbError = txError
    } else {
      // Update other metadata fields as part of the update
      const { data: updated, error: metadataError } = await supabase
        .from('catalogs')
        .update({
          title_en: data.title_en,
          title_bn: data.title_bn,
          description_en: data.description_en,
          description_bn: data.description_bn,
          pdf_url: data.pdf_url,
          cover_image_url: data.cover_image_url,
          language: data.language,
          version: data.version,
          file_size: data.file_size,
          page_count: data.page_count,
          visibility: data.visibility,
          category: data.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      updatedCatalog = updated
      dbError = metadataError
    }
  } else {
    // Standard metadata and state updates
    const updatePayload: any = {
      title_en: data.title_en,
      title_bn: data.title_bn,
      description_en: data.description_en,
      description_bn: data.description_bn,
      pdf_url: data.pdf_url,
      cover_image_url: data.cover_image_url,
      language: data.language,
      version: data.version,
      file_size: data.file_size,
      page_count: data.page_count,
      visibility: data.visibility,
      category: data.category,
      updated_at: new Date().toISOString()
    }

    if (data.status) {
      updatePayload.status = data.status
      if (data.status === 'draft') {
        updatePayload.published_at = null
        updatePayload.published_by = null
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('catalogs')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    updatedCatalog = updated
    dbError = updateError
  }

  if (dbError || !updatedCatalog) {
    // Failure Recovery: Clean up newly uploaded files to prevent orphan storage leaks on error
    if (data.pdf_url && data.pdf_url !== currentCatalog.pdf_url) {
      await deleteStorageFile(supabase, data.pdf_url)
    }
    if (data.cover_image_url && data.cover_image_url !== currentCatalog.cover_image_url) {
      await deleteStorageFile(supabase, data.cover_image_url)
    }
    return { success: false, message: dbError?.message || 'Database update failed.' }
  }

  // Cleanup old files from storage if successfully replaced
  if (currentCatalog.pdf_url && data.pdf_url && currentCatalog.pdf_url !== data.pdf_url) {
    await deleteStorageFile(supabase, currentCatalog.pdf_url)
  }
  if (currentCatalog.cover_image_url && data.cover_image_url && currentCatalog.cover_image_url !== data.cover_image_url) {
    await deleteStorageFile(supabase, currentCatalog.cover_image_url)
  }

  // Log audit logs
  await logAudit('update_catalog', 'catalog', id, {
    previous_state: { status: currentCatalog.status, version: currentCatalog.version },
    new_state: { status: updatedCatalog.status, version: updatedCatalog.version }
  })

  // Targeted cache invalidations — both locales + layout patterns
  const locales = ['en', 'bn']
  locales.forEach(loc => {
    revalidatePath(`/${loc}/admin/catalogs`)
    revalidatePath(`/${loc}/admin/exhibitions/${updatedCatalog.exhibition_id}`)
    revalidatePath(`/${loc}/catalogs`)
    revalidatePath(`/${loc}/catalogs/${id}`)
    revalidatePath(`/${loc}/exhibitions/${updatedCatalog.exhibition_id}`)
  })
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(admin)/admin/exhibitions/[id]', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/exhibitions', 'layout')

  return { success: true, data: updatedCatalog }
}

export async function publishCatalog(id: string, publish: boolean) {
  const supabase = await createClient()

  // Verify auth and admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner', 'committee'].includes(profile.role)) {
    return { success: false, message: 'Forbidden: Admin access required' }
  }

  const { data: currentCatalog } = await supabase
    .from('catalogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!currentCatalog) return { success: false, message: 'Catalog not found.' }

  const targetStatus = publish ? 'published' : 'draft'
  const transition = validateStateTransition(currentCatalog.status, targetStatus)
  if (!transition.valid) return { success: false, message: transition.error }

  let error
  if (publish) {
    // Invoke transactional RPC
    const { error: txError } = await supabase.rpc('publish_catalog_transaction', {
      p_catalog_id: id,
      p_admin_id: user.id
    })
    error = txError
  } else {
    // Unpublish back to draft
    const { error: updateError } = await supabase
      .from('catalogs')
      .update({
        status: 'draft',
        published_at: null,
        published_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    error = updateError
  }

  if (error) return { success: false, message: error.message }

  // Log audit logs
  await logAudit('update_catalog', 'catalog', id, {
    action: publish ? 'publish_catalog' : 'unpublish_catalog',
    previous_state: currentCatalog.status,
    new_state: targetStatus
  })

  const locales = ['en', 'bn']
  locales.forEach(loc => {
    revalidatePath(`/${loc}/admin/catalogs`)
    revalidatePath(`/${loc}/admin/exhibitions/${currentCatalog.exhibition_id}`)
    revalidatePath(`/${loc}/catalogs`)
    revalidatePath(`/${loc}/catalogs/${id}`)
    revalidatePath(`/${loc}/exhibitions/${currentCatalog.exhibition_id}`)
  })
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(admin)/admin/exhibitions/[id]', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/exhibitions', 'layout')

  return { success: true }
}

export async function duplicateCatalog(id: string) {
  const supabase = await createClient()

  // Verify auth and admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner', 'committee'].includes(profile.role)) {
    return { success: false, message: 'Forbidden: Admin access required' }
  }

  // Fetch target record
  const { data: source } = await supabase
    .from('catalogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!source) return { success: false, message: 'Source catalog not found.' }

  const duplicatePayload = {
    exhibition_id: source.exhibition_id,
    title_en: `${source.title_en} (Copy)`,
    title_bn: source.title_bn ? `${source.title_bn} (অনুলিপি)` : null,
    description_en: source.description_en,
    description_bn: source.description_bn,
    pdf_url: source.pdf_url,
    cover_image_url: source.cover_image_url,
    language: source.language,
    version: `${source.version}-copy`,
    file_size: source.file_size,
    page_count: source.page_count,
    status: 'draft', // Must be created as draft
    visibility: source.visibility,
    category: source.category
  }

  const { data: newCatalog, error } = await supabase
    .from('catalogs')
    .insert([duplicatePayload])
    .select()
    .single()

  if (error) return { success: false, message: error.message }

  // Log audit trail
  await logAudit('create_catalog', 'catalog', newCatalog.id, {
    action: 'duplicate_catalog',
    source_id: id,
    version: newCatalog.version
  })

  const locales = ['en', 'bn']
  locales.forEach(loc => {
    revalidatePath(`/${loc}/admin/catalogs`)
    revalidatePath(`/${loc}/admin/exhibitions/${source.exhibition_id}`)
    revalidatePath(`/${loc}/catalogs`)
  })
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(admin)/admin/exhibitions/[id]', 'layout')

  return { success: true, data: newCatalog }
}

export async function deleteCatalog(id: string) {
  const supabase = await createClient()

  // Verify auth and admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner', 'committee'].includes(profile.role)) {
    return { success: false, message: 'Forbidden: Admin access required' }
  }

  // Retrieve files before row is deleted
  const { data: catalog } = await supabase
    .from('catalogs')
    .select('pdf_url, cover_image_url, exhibition_id')
    .eq('id', id)
    .single()

  if (!catalog) return { success: false, message: 'Catalog record not found.' }

  // Perform database delete operation
  const { error } = await supabase
    .from('catalogs')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  // Atomic storage removal of related objects (cleanup storage leaks)
  if (catalog.pdf_url) {
    await deleteStorageFile(supabase, catalog.pdf_url)
  }
  if (catalog.cover_image_url) {
    await deleteStorageFile(supabase, catalog.cover_image_url)
  }

  // Log audit trail
  await logAudit('delete_catalog', 'catalog', id, {
    exhibition_id: catalog.exhibition_id
  })

  const locales = ['en', 'bn']
  locales.forEach(loc => {
    revalidatePath(`/${loc}/admin/catalogs`)
    revalidatePath(`/${loc}/admin/exhibitions/${catalog.exhibition_id}`)
    revalidatePath(`/${loc}/catalogs`)
    revalidatePath(`/${loc}/catalogs/${id}`)
    revalidatePath(`/${loc}/exhibitions/${catalog.exhibition_id}`)
  })
  revalidatePath('/[locale]/(admin)/admin/catalogs', 'layout')
  revalidatePath('/[locale]/(admin)/admin/exhibitions/[id]', 'layout')
  revalidatePath('/[locale]/(public)/catalogs', 'layout')
  revalidatePath('/[locale]/(public)/exhibitions', 'layout')

  return { success: true }
}

export async function incrementDownloadCount(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  // Call RPC function that registers detailed analytics logs
  const { error } = await supabase.rpc('increment_catalog_downloads', {
    catalog_id: id,
    p_user_id: user?.id || null,
    p_ip: null,
    p_country: null
  })

  return { success: !error }
}
