'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/actions/notifications"
import { logAudit } from "@/lib/audit"
import { artworkSubmissionSchema } from "@/lib/validations/schemas"

export async function submitArtwork(payload: {
  title_en: string
  title_bn?: string
  description_en?: string
  description_bn?: string
  medium_en?: string
  medium_bn?: string
  width?: number
  height?: number
  framed?: boolean
  price?: string
  main_image_url?: string
  exhibitionId?: string
  // Allow extra UI-only fields (e.g. theme, category, availability, image_file) to pass through
  [key: string]: unknown
}) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate with Zod
  const validation = artworkSubmissionSchema.safeParse({
    title_en: payload.title_en,
    title_bn: payload.title_bn,
    description_en: payload.description_en,
    description_bn: payload.description_bn,
    medium_en: payload.medium_en,
    medium_bn: payload.medium_bn,
    width: payload.width,
    height: payload.height,
    framed: payload.framed,
    price: payload.price,
    main_image_url: payload.main_image_url,
    exhibitionId: payload.exhibitionId,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const data = validation.data

  let targetExhibitionId = data.exhibitionId
  if (!targetExhibitionId) {
    const { getFeaturedExhibition } = await import("@/lib/exhibition-lifecycle")
    const featured = await getFeaturedExhibition()
    if (featured) {
      targetExhibitionId = featured.id
    }
  }

  const artworkRecord = {
    artist_id: user.id,
    exhibition_id: targetExhibitionId || null,
    title_en: data.title_en,
    title_bn: data.title_bn || null,
    description_en: data.description_en || null,
    description_bn: data.description_bn || null,
    medium_en: data.medium_en || null,
    medium_bn: data.medium_bn || null,
    dimensions:
      data.width && data.height
        ? `${data.width} x ${data.height} cm${data.framed ? ' (Framed)' : ''}`
        : null,
    year: new Date().getFullYear(),
    status: 'pending' as const,
    price: data.price ? parseFloat(data.price) : null,
    main_image_url: data.main_image_url || null,
  }

  const { data: inserted, error } = await supabase
    .from('artworks')
    .insert([artworkRecord])
    .select('id')
    .single()

  if (error) {
    console.error('Artwork submission error:', error.message)
    return { error: 'Failed to submit artwork. Please try again.' }
  }

  const artworkId = inserted.id

  // Handle exhibition registration if targetExhibitionId was found
  if (targetExhibitionId) {
    const { data: existingReg } = await supabase
      .from('exhibition_participants')
      .select('id')
      .eq('exhibition_id', targetExhibitionId)
      .eq('artist_id', user.id)
      .maybeSingle()

    if (!existingReg) {
      await supabase.from('exhibition_participants').insert([{
        exhibition_id: targetExhibitionId,
        artist_id: user.id,
        status: 'pending',
      }])
    }
  }

  // Audit log
  await logAudit('submit_artwork', 'artwork', artworkId, {
    action: 'submit',
    title: data.title_en,
  })

  // Confirmation notification to the artist
  await createNotification(
    user.id,
    'submission_received',
    `Your artwork "${data.title_en}" has been received and is pending review.`,
    `আপনার শিল্পকর্ম "${data.title_bn || data.title_en}" সফলভাবে জমা দেওয়া হয়েছে এবং পর্যালোচনার অপেক্ষায় রয়েছে।`,
    {
      subject: 'Rongdhonu: Artwork Submission Received',
      html: `<p>Hello,</p><p>We have received your artwork <strong>${data.title_en}</strong>. Our admins will review it shortly.</p>`,
      category: 'notify_artwork_updates',
    }
  )

  revalidatePath('/[locale]/(protected)/dashboard/artworks', 'page')
  return { success: true, artworkId }
}
