 
 
 
 
import { createClient } from '@/lib/supabase/server'
import { fallbackCMSContent } from './fallbacks'

/**
 * Fetches CMS content for a specific page and section.
 * Falls back to local demo content if the database is empty or the row is missing.
 */
export async function getCmsContent(page: string, section: string, locale: string) {
  const supabase = await createClient()
  
  // Try to fetch from DB
  const { data, error } = await supabase
    .from('cms_content')
    .select('content_en, content_bn')
    .eq('page', page)
    .eq('section', section)
    .single()

  // If error (e.g. no rows) or data is empty, use fallback
  if (error || !data) {
    const fallbackSection = fallbackCMSContent[page]?.[section]
    
    if (!fallbackSection) {
      console.warn(`[CMS] Missing fallback for ${page}/${section}`)
      return {}
    }
    
    return extractLocalizedContent(fallbackSection, locale)
  }

  // Determine which column to use based on locale
  const content = locale === 'bn' && data.content_bn 
    ? data.content_bn 
    : data.content_en

  // If the DB jsonb is somehow empty, fallback to the local object
  if (!content || Object.keys(content).length === 0) {
    const fallbackSection = fallbackCMSContent[page]?.[section] || {}
    return extractLocalizedContent(fallbackSection, locale)
  }

  return content as Record<string, any>
}

/**
 * Helper to extract locale-specific strings from a fallback object containing both _en and _bn keys.
 */
function extractLocalizedContent(content: Record<string, any>, locale: string) {
  const localized: Record<string, any> = {}
  
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
