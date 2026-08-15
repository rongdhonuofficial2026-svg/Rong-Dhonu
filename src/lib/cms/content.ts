import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { fallbackCMSContent } from './fallbacks'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Fetches CMS content for a specific page and section.
 * Falls back to local default content if the database is empty or the row is missing.
 */
export async function getCmsContent(page: string, section: string, locale: string) {
  try {
    
    // Try to fetch from DB using the new normalized schema
    const { data: contentRows, error } = await supabase
      .from('cms_content')
      .select(`
        field_key,
        field_type,
        value_en,
        value_bn,
        metadata,
        cms_sections!inner(
          section_key,
          enabled,
          cms_pages!inner(
            slug,
            status
          )
        )
      `)
      .eq('cms_sections.cms_pages.slug', page)
      .eq('cms_sections.section_key', section)

    // Handle database error or empty results
    if (error || !contentRows || contentRows.length === 0) {
      const fallbackSection = fallbackCMSContent[page]?.[section]
      if (!fallbackSection) {
        console.warn(`[CMS] Missing fallback for ${page}/${section}`)
        return {}
      }
      return extractLocalizedContent(fallbackSection, locale)
    }

    // Check section visibility toggle
    const sectionData = contentRows[0]?.cms_sections as any
    const isEnabled = sectionData?.enabled !== false
    if (!isEnabled) {
      return { enabled: false }
    }

    // Process and construct content object
    const contentObj: Record<string, any> = { enabled: true }
    for (const row of contentRows) {
      const value = locale === 'bn' ? (row.value_bn || row.value_en) : row.value_en
      
      if (row.field_type === 'json') {
        try {
          contentObj[row.field_key] = JSON.parse(value || '[]')
        } catch {
          contentObj[row.field_key] = []
        }
      } else {
        contentObj[row.field_key] = value || ''
      }

      // If it's a button, map sub-fields (url, variant, open_in_new_tab)
      if (row.field_type === 'button') {
        const btnMeta = row.metadata as Record<string, any> || {}
        contentObj[`${row.field_key}_url`] = btnMeta.url || '#'
        contentObj[`${row.field_key}_variant`] = btnMeta.variant || 'primary'
        contentObj[`${row.field_key}_open_in_new_tab`] = btnMeta.open_in_new_tab || false
        contentObj[`${row.field_key}_disabled`] = btnMeta.disabled || false
      }
    }

    // Some fields are stored as separate per-locale rows (field_key literally
    // suffixed "_en"/"_bn", e.g. ctaPrimary_en / ctaPrimary_bn) rather than using
    // this table's own value_en/value_bn columns for localization. Resolve those
    // down to a canonical unsuffixed key too, the same way extractLocalizedContent()
    // already does for fallback content below, so consumers can read a single
    // locale-appropriate `ctaPrimary` regardless of which storage convention a
    // given field used. Original suffixed keys are left in place, nothing removed.
    for (const key of Object.keys(contentObj)) {
      const match = key.match(/^(.+)_(en|bn)$/)
      if (!match) continue
      const baseKey = match[1]
      if (contentObj[baseKey] !== undefined) continue
      contentObj[baseKey] = locale === 'bn'
        ? (contentObj[`${baseKey}_bn`] || contentObj[`${baseKey}_en`])
        : (contentObj[`${baseKey}_en`] || contentObj[`${baseKey}_bn`])
    }

    return contentObj
  } catch (err) {
    console.error(`[CMS Exception] Failed to load ${page}/${section}:`, err)
    const fallbackSection = fallbackCMSContent[page]?.[section] || {}
    return extractLocalizedContent(fallbackSection, locale)
  }
}

/**
 * Fetches the ordered layout configuration of CMS sections for a given page.
 */
export async function getCmsSectionLayout(page: string) {
  try {
    const { data, error } = await supabase
      .from('cms_sections')
      .select('section_key, display_order, enabled, component_type, cms_pages!inner(slug, status)')
      .eq('cms_pages.slug', page)
      .eq('cms_pages.status', 'published')
      .order('display_order', { ascending: true })

    if (error || !data) return []
    return data
  } catch (err) {
    console.error(`[CMS] Error fetching layout for ${page}:`, err)
    return []
  }
}

/**
 * Helper to extract locale-specific strings from a fallback object containing both _en and _bn keys.
 */
function extractLocalizedContent(content: Record<string, any>, locale: string) {
  const localized: Record<string, any> = { enabled: true }
  
  for (const key in content) {
    if (key.endsWith('_en') || key.endsWith('_bn')) {
      // It's a localized string key
      const baseKey = key.replace(/_(en|bn)$/, '')
      
      // We only want to process the baseKey once
      if (!localized[baseKey]) {
        if (locale === 'bn' && content[`${baseKey}_bn`]) {
          localized[baseKey] = content[`${baseKey}_bn`]
        } else {
          localized[baseKey] = content[`${baseKey}_en`] || content[key] // fallback to whatever is there
        }
      }
    } else {
      // It's a regular key (e.g., array of items, or string without localization)
      localized[key] = content[key]
    }
  }
  
  return localized
}
