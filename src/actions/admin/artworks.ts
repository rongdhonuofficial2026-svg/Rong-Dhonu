'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateArtworkSchema } from "@/lib/validations/schemas"
import { canAccessAdmin } from "@/lib/auth/roles"

// ─────────────────────────────────────────────────────────────────────────────
// Helper: revalidate every affected page in both locales
// ─────────────────────────────────────────────────────────────────────────────
function revalidateAll(exhibitionId?: string | null, artistId?: string | null) {
  const locales = ['en', 'bn']
  const staticPaths = [
    '/admin/artworks',
    '/admin/exhibitions',
    '/dashboard/artworks',
    '/gallery',
    '/',
  ]
  const revalidated: string[] = []
  for (const locale of locales) {
    for (const path of staticPaths) {
      const full = `/${locale}${path}`
      revalidatePath(full)
      revalidated.push(full)
    }
    if (exhibitionId) {
      const paths = [
        `/${locale}/admin/exhibitions/${exhibitionId}/moderation`,
        `/${locale}/admin/exhibitions/${exhibitionId}`,
        `/${locale}/exhibitions/${exhibitionId}`,
      ]
      paths.forEach(p => { revalidatePath(p); revalidated.push(p) })
    }
    if (artistId) {
      const p = `/${locale}/artists/${artistId}`
      revalidatePath(p)
      revalidated.push(p)
    }
  }
  return revalidated
}

// ─────────────────────────────────────────────────────────────────────────────
// moderateArtwork
// ─────────────────────────────────────────────────────────────────────────────
export async function moderateArtwork(
  artworkId: string,
  status: 'approved' | 'rejected' | 'changes_requested',
  feedback?: string
) {
  // ── Step 2: Schema validation ──────────────────────────────────────────────
  const validation = moderateArtworkSchema.safeParse({ artworkId, status, feedback })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // ── Step 3: Client-side feedback guard ────────────────────────────────────
  if ((status === 'rejected' || status === 'changes_requested') && !feedback?.trim()) {
    return { error: 'Moderator feedback is required for rejection or revision requests.' }
  }

  const { artworkId: validId, status: validStatus, feedback: validFeedback } = validation.data
  const trimmedFeedback = validFeedback?.trim() || null

  // ── Step 4: Auth ───────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // ── Step 5: Admin role check ───────────────────────────────────────────────
  const { data: adminProfile, error: roleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !adminProfile || !canAccessAdmin(adminProfile.role)) {
    return { error: 'Forbidden: Admin access required' }
  }

  // ── Step 7: RPC call ───────────────────────────────────────────────────────
  const { data: rpcResult, error: rpcError } = await supabase.rpc('moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status:     validStatus,
    p_admin_id:   user.id,
    p_reason:     trimmedFeedback,
  })

  if (rpcError) {
    return { error: rpcError.message }
  }

  // ── Step 9: Audit log ─────────────────────────────────────────────────────
  const result = rpcResult as {
    artwork_id:    string
    old_status:    string
    new_status:    string
    exhibition_id: string
    artist_id:     string
    title:         string
  } | null

  const exhibitionId = result?.exhibition_id ?? null
  const artistId     = result?.artist_id ?? null
  const artworkTitle = result?.title ?? 'your artwork'

  await supabase.from('audit_logs').insert({
    actor_id:    user.id,
    action:      'moderate_artwork',
    entity_type: 'artwork',
    entity_id:   validId,
    details: {
      old_status:    result?.old_status,
      new_status:    validStatus,
      exhibition_id: exhibitionId,
      reason:        trimmedFeedback,
    },
  })

  // ── Step 10: Notification ─────────────────────────────────────────────────
  const notifType =
    validStatus === 'approved'          ? 'submission_approved'  :
    validStatus === 'rejected'          ? 'submission_rejected'  :
    /* changes_requested */               'changes_requested'

  const notifMsgEn =
    validStatus === 'approved'
      ? `Congratulations! Your artwork "${artworkTitle}" has been approved for the exhibition.`
      : validStatus === 'rejected'
      ? `Your artwork "${artworkTitle}" was not selected. Reason: ${trimmedFeedback ?? 'No reason provided.'}`
      : `Your artwork "${artworkTitle}" requires revisions. Feedback: ${trimmedFeedback}`

  const notifMsgBn =
    validStatus === 'approved'
      ? `Your artwork has been approved.`
      : validStatus === 'rejected'
      ? `Your artwork was not selected.`
      : `Your artwork requires revisions.`

  if (artistId) {
    await supabase.from('notifications').insert({
      user_id:    artistId,
      type:       notifType,
      message_en: notifMsgEn,
      message_bn: notifMsgBn,
    })
  }

  // ── Step 11: Cache revalidation ───────────────────────────────────────────
  revalidateAll(exhibitionId, artistId)

  // ── Step 12: Final response ───────────────────────────────────────────────
  return { success: true }
}


// ─────────────────────────────────────────────────────────────────────────────
// resubmitArtwork — Artist submits revised artwork (changes_requested → pending)
// ─────────────────────────────────────────────────────────────────────────────
export async function resubmitArtwork(
  artworkId: string,
  updates: {
    title_en?: string
    title_bn?: string
    description_en?: string
    description_bn?: string
    medium_en?: string
    medium_bn?: string
    dimensions?: string
    category?: string
    main_image_url?: string
    price?: number | null
    revision_notes?: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Apply field updates before transition (only if status = changes_requested)
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).map(([k, v]) => {
      // Map empty strings to null so they can clear out in the database if desired
      if (v === '') return [k, null]
      return [k, v]
    }).filter(([, v]) => v !== undefined)
  )
  if (Object.keys(filteredUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
      .eq('id', artworkId)
      .eq('artist_id', user.id)
      .eq('status', 'changes_requested')

    if (updateError) return { error: updateError.message }
  }

  // Transition via RPC
  const { data: rpcResult, error: rpcError } = await supabase.rpc('resubmit_artwork', {
    p_artwork_id: artworkId,
    p_artist_id:  user.id,
  })

  if (rpcError) return { error: rpcError.message }

  const result = rpcResult as { exhibition_id?: string; title?: string } | null

  // Notification for artist (confirmation)
  await supabase.from('notifications').insert({
    user_id:    user.id,
    type:       'submission_received',
    message_en: `Your revised artwork "${result?.title ?? 'artwork'}" has been resubmitted for moderator review.`,
    message_bn: `Your revised artwork has been resubmitted.`,
  })

  revalidateAll(result?.exhibition_id, user.id)

  return { success: true }
}
