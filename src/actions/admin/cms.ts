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

  // 1. Create a snapshot/version of the current state before overwriting
  const { data: current } = await supabase.from('cms_content').select('*').eq('page_key', pageKey).eq('locale', locale).single()

  if (current && mode === 'published') {
    // Save history revision
    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      action: 'CMS_REVISION',
      entity_type: 'cms',
      entity_id: current.id,
      details: { previous_content: current.content }
    }])
  }

  // 2. Upsert new content
  const { error } = await supabase.from('cms_content').upsert({
    page_key: pageKey,
    locale: locale,
    content: content
    // 'status': mode -- if schema supported it. Assuming we just publish directly for now.
  }, { onConflict: 'page_key, locale' })

  if (error) return { error: error.message }

  // Log action
  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    action: `CMS_${mode.toUpperCase()}`,
    entity_type: 'cms',
    entity_id: 'homepage',
    details: { page_key: pageKey, locale }
  }])

  revalidatePath(`/${locale}`)
  return { success: true }
}
