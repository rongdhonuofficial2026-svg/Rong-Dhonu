import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // 1. Fetch pending schedules whose publish datetime is due
    const { data: schedules, error: fetchErr } = await supabase
      .from('cms_schedules')
      .select('*, cms_pages!inner(id, slug)')
      .eq('status', 'scheduled')
      .lte('publish_at', new Date().toISOString())

    if (fetchErr) throw fetchErr

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ success: true, message: 'No scheduled CMS publishes pending.' })
    }

    const completedSchedules: string[] = []

    for (const sched of schedules) {
      const page = sched.cms_pages
      const snapshot = sched.snapshot as any
      const sections = snapshot.sections || []

      try {
        // Start publishing snapshot content
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

        // Update schedule status to completed
        await supabase
          .from('cms_schedules')
          .update({ status: 'completed' })
          .eq('id', sched.id)

        // Set page live status to published
        await supabase
          .from('cms_pages')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('id', page.id)

        completedSchedules.push(page.slug)
      } catch (err: any) {
        console.error(`[CMS Cron Publish Exception] Page ${page.slug}:`, err)
        await supabase
          .from('cms_schedules')
          .update({ status: 'failed' })
          .eq('id', sched.id)
      }
    }

    if (completedSchedules.length > 0) {
      // Revalidate cache paths to propagate live edits
      revalidatePath('/')
      revalidatePath('/en')
      revalidatePath('/bn')
      revalidatePath('/about')
      revalidatePath('/contact')
      revalidatePath('/gallery')
      revalidatePath('/exhibitions')
      revalidatePath('/catalogs')
    }

    return NextResponse.json({
      success: true,
      message: `Completed releases for scheduled page updates: ${completedSchedules.join(', ')}`
    })
  } catch (err: any) {
    console.error('[CMS Scheduler API Error]:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
