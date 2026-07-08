'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

// Helper to check user authorization
async function checkCMSPermission() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized access')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner' && profile.role !== 'committee')) {
    throw new Error('Insufficient permissions to manage website content')
  }

  return user.id
}

/**
 * Lists all pages, their layout sections, content fields, and media mapping.
 */
export async function getCmsPages() {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    const { data: pages, error } = await supabase
      .from('cms_pages')
      .select(`
        id,
        slug,
        title,
        status,
        updated_at,
        cms_sections (
          id,
          section_key,
          component_type,
          display_order,
          enabled,
          cms_content (
            id,
            field_key,
            field_type,
            value_en,
            value_bn,
            metadata,
            cms_media (
              id,
              storage_path,
              alt_text_en,
              alt_text_bn,
              focal_point,
              crop_settings
            )
          )
        )
      `)
      .order('slug')

    if (error) throw error

    // Sort sections locally by display_order
    const sortedPages = pages?.map((page: any) => {
      const sortedSections = page.cms_sections?.sort((a: any, b: any) => a.display_order - b.display_order) || []
      return { ...page, cms_sections: sortedSections }
    }) || []

    return { success: true, pages: sortedPages }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Saves content modifications as a draft.
 */
export async function saveCMSDraft(pageSlug: string, sections: any[]) {
  try {
    const actorId = await checkCMSPermission()
    const supabase = await createClient()

    // 1. Get Page ID
    const { data: page, error: pageErr } = await supabase
      .from('cms_pages')
      .select('id')
      .eq('slug', pageSlug)
      .single()

    if (pageErr || !page) throw new Error('CMS Page not found')

    // 2. Iterate through sections to save draft
    for (const sec of sections) {
      // Upsert Section details
      const { data: sectionRow, error: secErr } = await supabase
        .from('cms_sections')
        .upsert({
          id: sec.id || undefined,
          page_id: page.id,
          section_key: sec.section_key,
          component_type: sec.component_type,
          display_order: sec.display_order,
          enabled: sec.enabled !== false
        }, { onConflict: 'page_id, section_key' })
        .select('id')
        .single()

      if (secErr || !sectionRow) throw new Error(`Failed to upsert section ${sec.section_key}`)

      // Upsert Content Fields
      if (sec.cms_content && Array.isArray(sec.cms_content)) {
        for (const field of sec.cms_content) {
          const { data: contentRow, error: fieldErr } = await supabase
            .from('cms_content')
            .upsert({
              id: field.id || undefined,
              section_id: sectionRow.id,
              field_key: field.field_key,
              field_type: field.field_type || 'text',
              value_en: field.value_en,
              value_bn: field.value_bn,
              metadata: field.metadata || {}
            }, { onConflict: 'section_id, field_key' })
            .select('id')
            .single()

          if (fieldErr || !contentRow) throw new Error(`Failed to upsert field ${field.field_key}`)

          // Upsert Media Details if field is of type 'media'
          if (field.field_type === 'media' && field.cms_media) {
            const media = field.cms_media
            await supabase
              .from('cms_media')
              .upsert({
                id: media.id || undefined,
                content_id: contentRow.id,
                storage_path: media.storage_path || '',
                alt_text_en: media.alt_text_en,
                alt_text_bn: media.alt_text_bn,
                focal_point: media.focal_point || { x: 0.5, y: 0.5 },
                crop_settings: media.crop_settings || {}
              }, { onConflict: 'content_id' })
          }
        }
      }
    }

    // 3. Mark page status as draft
    await supabase
      .from('cms_pages')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('slug', pageSlug)

    await logAudit('update_catalog' as any, 'catalog', page.id, { action: 'CMS_DRAFT_SAVE', slug: pageSlug })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Publishes draft content to live immediately and captures a version snapshot.
 */
export async function publishCMSPage(pageSlug: string, changeSummary?: string) {
  try {
    const actorId = await checkCMSPermission()
    const supabase = await createClient()

    // 1. Get Page ID and current schema snapshot
    const { data: page, error: pageErr } = await supabase
      .from('cms_pages')
      .select('id, title')
      .eq('slug', pageSlug)
      .single()

    if (pageErr || !page) throw new Error('CMS Page not found')

    // 2. Fetch all sections and content fields to generate snapshot
    const { data: fullSections } = await supabase
      .from('cms_sections')
      .select(`
        id,
        section_key,
        component_type,
        display_order,
        enabled,
        cms_content (
          id,
          field_key,
          field_type,
          value_en,
          value_bn,
          metadata,
          cms_media (
            id,
            storage_path,
            alt_text_en,
            alt_text_bn,
            focal_point,
            crop_settings
          )
        )
      `)
      .eq('page_id', page.id)

    const snapshot = {
      sections: fullSections || []
    }

    // 3. Get the latest version number
    const { data: versions } = await supabase
      .from('cms_versions')
      .select('version')
      .eq('page_id', page.id)
      .order('version', { ascending: false })
      .limit(1)

    const nextVer = versions && versions.length > 0 ? (versions[0].version + 1) : 1

    // 4. Create version snapshot in cms_versions
    const { error: verErr } = await supabase
      .from('cms_versions')
      .insert({
        page_id: page.id,
        version: nextVer,
        snapshot: snapshot,
        change_summary: changeSummary || `Publish Version ${nextVer}`,
        created_by: actorId
      })

    if (verErr) throw verErr

    // 5. Update page status to published
    await supabase
      .from('cms_pages')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('slug', pageSlug)

    await logAudit('publish_catalog' as any, 'catalog', page.id, { action: 'CMS_PUBLISH', version: nextVer, slug: pageSlug })

    // 6. Revalidate public cache paths
    revalidatePath('/')
    revalidatePath('/en')
    revalidatePath('/bn')
    revalidatePath(`/about`)
    revalidatePath(`/contact`)
    revalidatePath(`/gallery`)
    revalidatePath(`/exhibitions`)
    revalidatePath(`/catalogs`)

    return { success: true, version: nextVer }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Creates a scheduled update to publish page content at a future date.
 */
export async function scheduleCMSPublish(pageSlug: string, publishTime: string, snapshot: any) {
  try {
    const actorId = await checkCMSPermission()
    const supabase = await createClient()

    const { data: page, error: pageErr } = await supabase
      .from('cms_pages')
      .select('id')
      .eq('slug', pageSlug)
      .single()

    if (pageErr || !page) throw new Error('CMS Page not found')

    const publishDate = new Date(publishTime)
    if (publishDate.getTime() <= Date.now()) {
      throw new Error('Publish schedule time must be in the future')
    }

    const { error: schedErr } = await supabase
      .from('cms_schedules')
      .insert({
        page_id: page.id,
        publish_at: publishDate.toISOString(),
        snapshot: snapshot,
        status: 'scheduled',
        created_by: actorId
      })

    if (schedErr) throw schedErr

    // Update page status to scheduled
    await supabase
      .from('cms_pages')
      .update({ status: 'scheduled', updated_at: new Date().toISOString() })
      .eq('slug', pageSlug)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Lists version history snapshots for a specific page.
 */
export async function getPageVersions(pageSlug: string) {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    const { data: page } = await supabase
      .from('cms_pages')
      .select('id')
      .eq('slug', pageSlug)
      .single()

    if (!page) throw new Error('Page not found')

    const { data: versions, error } = await supabase
      .from('cms_versions')
      .select(`
        id,
        version,
        change_summary,
        created_at,
        created_by,
        snapshot,
        profiles:created_by (full_name_en)
      `)
      .eq('page_id', page.id)
      .order('version', { ascending: false })

    if (error) throw error

    return { success: true, versions }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Rolls back page active content to match a selected version snapshot.
 */
export async function rollbackToVersion(pageSlug: string, snapshot: any, changeSummary: string) {
  try {
    const actorId = await checkCMSPermission()
    const supabase = await createClient()

    const { data: page, error: pageErr } = await supabase
      .from('cms_pages')
      .select('id')
      .eq('slug', pageSlug)
      .single()

    if (pageErr || !page) throw new Error('Page not found')

    const sections = snapshot.sections || []

    // Upsert all snapshot values to DB content tables
    for (const sec of sections) {
      const { data: sectionRow, error: secErr } = await supabase
        .from('cms_sections')
        .upsert({
          page_id: page.id,
          section_key: sec.section_key,
          component_type: sec.component_type,
          display_order: sec.display_order,
          enabled: sec.enabled !== false
        }, { onConflict: 'page_id, section_key' })
        .select('id')
        .single()

      if (secErr || !sectionRow) continue

      if (sec.cms_content) {
        for (const field of sec.cms_content) {
          const { data: contentRow, error: fieldErr } = await supabase
            .from('cms_content')
            .upsert({
              section_id: sectionRow.id,
              field_key: field.field_key,
              field_type: field.field_type || 'text',
              value_en: field.value_en,
              value_bn: field.value_bn,
              metadata: field.metadata || {}
            }, { onConflict: 'section_id, field_key' })
            .select('id')
            .single()

          if (fieldErr || !contentRow) continue

          if (field.field_type === 'media' && field.cms_media) {
            const media = field.cms_media
            await supabase
              .from('cms_media')
              .upsert({
                content_id: contentRow.id,
                storage_path: media.storage_path || '',
                alt_text_en: media.alt_text_en,
                alt_text_bn: media.alt_text_bn,
                focal_point: media.focal_point || { x: 0.5, y: 0.5 },
                crop_settings: media.crop_settings || {}
              }, { onConflict: 'content_id' })
          }
        }
      }
    }

    // After restoring snapshot content, publish page immediately
    return await publishCMSPage(pageSlug, changeSummary)
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Updates sections display order.
 */
export async function reorderCMSSections(pageSlug: string, orderedSectionIds: string[]) {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    for (let index = 0; index < orderedSectionIds.length; index++) {
      const secId = orderedSectionIds[index]
      await supabase
        .from('cms_sections')
        .update({ display_order: index })
        .eq('id', secId)
    }

    // Set page to draft since layout order changed
    await supabase
      .from('cms_pages')
      .update({ status: 'draft' })
      .eq('slug', pageSlug)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Exports all CMS configurations for backup purposes.
 */
export async function exportCMSData() {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    const { data: pages } = await supabase.from('cms_pages').select('*')
    const { data: sections } = await supabase.from('cms_sections').select('*')
    const { data: content } = await supabase.from('cms_content').select('*')
    const { data: media } = await supabase.from('cms_media').select('*')
    const { data: versions } = await supabase.from('cms_versions').select('*')
    const { data: schedules } = await supabase.from('cms_schedules').select('*')

    return {
      success: true,
      backup: { pages, sections, content, media, versions, schedules }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Imports CMS data from a backup snapshot (Restore feature).
 */
export async function importCMSData(backup: any) {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    if (!backup || !backup.pages) throw new Error('Invalid backup file structure')

    // Truncate existing CMS data
    await supabase.from('cms_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('cms_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('cms_pages').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Restore pages
    for (const page of backup.pages) {
      await supabase.from('cms_pages').insert(page)
    }
    // Restore sections
    for (const sec of (backup.sections || [])) {
      await supabase.from('cms_sections').insert(sec)
    }
    // Restore content
    for (const con of (backup.content || [])) {
      await supabase.from('cms_content').insert(con)
    }
    // Restore media
    for (const med of (backup.media || [])) {
      await supabase.from('cms_media').insert(med)
    }
    // Restore versions
    for (const ver of (backup.versions || [])) {
      await supabase.from('cms_versions').insert(ver)
    }

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Soft deletes an asset by setting is_deleted to true.
 * First verifies if asset is in use via cms_dependencies usage tracker.
 */
export async function deleteCMSAsset(assetId: string) {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    // Check if asset is currently in use
    const { data: deps, error: depErr } = await supabase
      .from('cms_dependencies')
      .select('*, cms_pages(title, slug), cms_sections(section_key)')
      .eq('asset_id', assetId)

    if (depErr) throw depErr

    if (deps && deps.length > 0) {
      const usages = deps.map((d: any) => `${d.cms_pages?.title} -> ${d.cms_sections?.section_key}`)
      return {
        success: false,
        error: `Asset cannot be deleted because it is in use by: ${usages.join(', ')}`
      }
    }

    // Soft delete media asset
    const { error: delErr } = await supabase
      .from('cms_media_assets')
      .update({ is_deleted: true })
      .eq('id', assetId)

    if (delErr) throw delErr

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Moves a section to the Recycle Bin (Soft Delete).
 */
export async function softDeleteSection(sectionId: string) {
  try {
    const actorId = await checkCMSPermission()
    const supabase = await createClient()

    // 1. Fetch section and full details
    const { data: section, error: fetchErr } = await supabase
      .from('cms_sections')
      .select(`
        *,
        cms_content (
          *,
          cms_media (*)
        )
      `)
      .eq('id', sectionId)
      .single()

    if (fetchErr || !section) throw new Error('Section not found')

    // 2. Insert details into recycle bin
    const { error: binErr } = await supabase
      .from('cms_recycle_bin')
      .insert({
        entity_type: 'section',
        original_id: section.id,
        deleted_data: section,
        deleted_by: actorId
      })

    if (binErr) throw binErr

    // 3. Delete section from main table
    await supabase.from('cms_sections').delete().eq('id', sectionId)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Restores a soft-deleted section from the Recycle Bin.
 */
export async function restoreFromRecycleBin(binId: string) {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    const { data: binItem, error: binErr } = await supabase
      .from('cms_recycle_bin')
      .select('*')
      .eq('id', binId)
      .single()

    if (binErr || !binItem) throw new Error('Recycle bin record not found')

    const sec = binItem.deleted_data as any

    // Restore section
    const { data: sectionRow, error: secErr } = await supabase
      .from('cms_sections')
      .insert({
        page_id: sec.page_id,
        section_key: sec.section_key,
        component_type: sec.component_type,
        display_order: sec.display_order,
        enabled: sec.enabled !== false
      })
      .select('id')
      .single()

    if (secErr || !sectionRow) throw new Error('Failed to restore section metadata')

    // Restore fields
    if (sec.cms_content) {
      for (const field of sec.cms_content) {
        const { data: contentRow } = await supabase
          .from('cms_content')
          .insert({
            section_id: sectionRow.id,
            field_key: field.field_key,
            field_type: field.field_type || 'text',
            value_en: field.value_en,
            value_bn: field.value_bn,
            metadata: field.metadata || {}
          })
          .select('id')
          .single()

        if (contentRow && field.cms_media) {
          const media = field.cms_media
          await supabase
            .from('cms_media')
            .insert({
              content_id: contentRow.id,
              storage_path: media.storage_path || '',
              alt_text_en: media.alt_text_en,
              alt_text_bn: media.alt_text_bn,
              focal_point: media.focal_point || { x: 0.5, y: 0.5 },
              crop_settings: media.crop_settings || {}
            })
        }
      }
    }

    // Delete recycle bin record
    await supabase.from('cms_recycle_bin').delete().eq('id', binId)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Returns Content Studio analytics and health statistics.
 */
export async function getCMSDashboardStats() {
  try {
    await checkCMSPermission()
    const supabase = await createClient()

    const [
      pagesRes,
      sectionsRes,
      subscribersRes,
      mediaRes,
      auditsRes
    ] = await Promise.all([
      supabase.from('cms_pages').select('id, status'),
      supabase.from('cms_sections').select('id, enabled'),
      supabase.from('profiles').select('id').eq('role', 'member'),
      supabase.from('cms_media_assets').select('id', { count: 'exact' }).eq('is_deleted', false),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(6)
    ])

    const totalPages = pagesRes.data?.length || 0
    const publishedPages = pagesRes.data?.filter(p => p.status === 'published').length || 0
    const totalSections = sectionsRes.data?.length || 0
    const activeSections = sectionsRes.data?.filter(s => s.enabled !== false).length || 0
    const subscriberCount = subscribersRes.data?.length || 0
    const mediaCount = mediaRes.count || 0
    const recentActivity = auditsRes.data || []

    return {
      success: true,
      stats: {
        totalPages,
        publishedPages,
        totalSections,
        activeSections,
        subscriberCount,
        mediaCount,
        recentActivity
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
