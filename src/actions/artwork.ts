'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
  category?: string
  theme?: string
  availability?: string
  [key: string]: unknown
}) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized. Please sign in and try again.' }
  }

  // Validate required fields
  const title = payload.title_en?.trim()
  if (!title || title.length < 2) {
    return { error: 'Artwork title (English) is required and must be at least 2 characters.' }
  }

  // Resolve exhibition: explicit selection takes priority, then auto-assign to active exhibition
  let targetExhibitionId: string | null = null
  
  const rawExhibitionId = payload.exhibitionId
  if (rawExhibitionId && rawExhibitionId !== 'none' && rawExhibitionId !== '') {
    // Validate it looks like a UUID before using it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(rawExhibitionId)) {
      targetExhibitionId = rawExhibitionId
    }
  }

  if (!targetExhibitionId) {
    // Auto-assign to active submission window
    const { getFeaturedExhibition } = await import("@/lib/exhibition-lifecycle")
    const featured = await getFeaturedExhibition()
    if (featured) {
      targetExhibitionId = featured.id
    }
  }

  // Build dimensions string
  const dimensionsStr = payload.width && payload.height
    ? `${payload.width} x ${payload.height} inches${payload.framed ? ' (Framed)' : ''}`
    : null

  // Build price value
  const priceVal = payload.price && payload.price !== '' 
    ? parseFloat(payload.price) 
    : null

  const artworkRecord = {
    artist_id: user.id,
    exhibition_id: targetExhibitionId,
    title_en: title,
    title_bn: payload.title_bn?.trim() || null,
    description_en: payload.description_en?.trim() || null,
    description_bn: payload.description_bn?.trim() || null,
    medium_en: payload.medium_en?.trim() || null,
    medium_bn: payload.medium_bn?.trim() || null,
    materials_en: null,
    materials_bn: null,
    dimensions: dimensionsStr,
    category: payload.category || null,
    theme: payload.theme || null,
    framed: payload.framed || false,
    status: 'pending' as const,
    price: priceVal,
    main_image_url: payload.main_image_url || null,
    availability: (payload.availability === 'available' ? 'available' : 'not_for_sale') as 'available' | 'not_for_sale',
  }

  const { data: inserted, error: insertError } = await supabase
    .from('artworks')
    .insert([artworkRecord])
    .select('id, title_en')
    .single()

  if (insertError) {
    console.error('Artwork insert error:', insertError)
    return { error: `Failed to save artwork: ${insertError.message}` }
  }

  const artworkId = inserted.id

  // If we have an image URL, also insert into artwork_images table
  if (payload.main_image_url) {
    await supabase.from('artwork_images').insert({
      artwork_id: artworkId,
      type: 'main',
      url_medium: payload.main_image_url,
      url_high: payload.main_image_url,
      url_thumbnail: payload.main_image_url,
      order_index: 0,
    })
  }

  // Auto-register artist as participant for the exhibition
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

  // Create submission confirmation notification for the artist
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'submission_received',
    message_en: `Your artwork "${title}" has been received and is pending review by our team.`,
    message_bn: `আপনার শিল্পকর্ম "${payload.title_bn || title}" সফলভাবে জমা দেওয়া হয়েছে। আমাদের টিম শীঘ্রই পর্যালোচনা করবে।`,
  })

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'submit_artwork',
    entity_type: 'artwork',
    entity_id: artworkId,
    details: { title: title, exhibition_id: targetExhibitionId },
  })

  // Revalidate all affected pages so moderation + dashboards refresh immediately
  revalidatePath(`/en/dashboard/artworks`)
  revalidatePath(`/bn/dashboard/artworks`)
  revalidatePath(`/en/admin/artworks`)
  revalidatePath(`/bn/admin/artworks`)
  revalidatePath(`/en/admin/exhibitions`)
  revalidatePath(`/bn/admin/exhibitions`)
  if (targetExhibitionId) {
    revalidatePath(`/en/admin/exhibitions/${targetExhibitionId}/moderation`)
    revalidatePath(`/bn/admin/exhibitions/${targetExhibitionId}/moderation`)
    revalidatePath(`/en/exhibitions/${targetExhibitionId}`)
    revalidatePath(`/bn/exhibitions/${targetExhibitionId}`)
  }

  return { success: true, artworkId }
}

export async function updateArtworkStatus(
  artworkId: string,
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested',
  notes?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Forbidden' }

  const { error } = await supabase
    .from('artworks')
    .update({ status, notes: notes || null })
    .eq('id', artworkId)

  if (error) return { error: error.message }

  revalidatePath(`/en/admin/artworks`)
  revalidatePath(`/bn/admin/artworks`)
  revalidatePath(`/en/gallery`)
  revalidatePath(`/bn/gallery`)
  revalidatePath(`/en`)
  revalidatePath(`/bn`)

  return { success: true }
}
