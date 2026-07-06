'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveCMSContent(pageKey: string, locale: string, content: Record<string, unknown>, mode: 'draft' | 'published') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Logically, we can upsert into cms_content. If it's a draft, maybe store in a separate column or table.
  // For this milestone, we will overwrite the main content if 'published', 
  // or we can store the history via audit_logs to achieve versioning/rollback.

  // For each section in content, upsert to cms_content
  for (const [section, sectionContent] of Object.entries(content)) {
    const { data: currentSection } = await supabase
      .from('cms_content')
      .select('*')
      .eq('page', pageKey)
      .eq('section', section)
      .single()

    const updatePayload: any = {
      page: pageKey,
      section: section,
      content_en: locale === 'en' ? sectionContent : (currentSection?.content_en || {}),
      content_bn: locale === 'bn' ? sectionContent : (currentSection?.content_bn || {})
    }

    if (currentSection) {
      updatePayload.id = currentSection.id
    }

    const { error } = await supabase.from('cms_content').upsert(updatePayload, { onConflict: 'page, section' })
    if (error) return { error: error.message }
  }

  // Log action
  await supabase.from('audit_logs').insert([{
    actor_id: user.id,
    action: `CMS_${mode.toUpperCase()}`,
    entity_type: 'cms',
    entity_id: 'homepage',
    details: { page_key: pageKey, locale }
  }])

  revalidatePath(`/${locale}`)
  return { success: true }
}
