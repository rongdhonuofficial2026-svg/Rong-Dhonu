'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateArtworkSchema } from "@/lib/validations/schemas"

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
  for (const locale of locales) {
    for (const path of staticPaths) {
      revalidatePath(`/${locale}${path}`)
    }
    if (exhibitionId) {
      revalidatePath(`/${locale}/admin/exhibitions/${exhibitionId}/moderation`)
      revalidatePath(`/${locale}/admin/exhibitions/${exhibitionId}`)
      revalidatePath(`/${locale}/exhibitions/${exhibitionId}`)
    }
    if (artistId) {
      revalidatePath(`/${locale}/artists/${artistId}`)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// moderateArtwork — Approve / Reject / Request Revision
//
// Architecture note:
// The RPC only performs the atomic artwork status UPDATE (state machine).
// This server action handles all side effects (audit log, notifications)
// using the Supabase client which runs as 'authenticated' — the role
// that RLS policies allow. This avoids the SECURITY DEFINER / RLS conflict
// that caused the transaction rollback and state revert bug.
// ─────────────────────────────────────────────────────────────────────────────
export async function moderateArtwork(
  artworkId: string,
  status: 'approved' | 'rejected' | 'changes_requested',
  feedback?: string
) {
  // 1. Validate inputs
  const validation = moderateArtworkSchema.safeParse({ artworkId, status, feedback })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // 2. Client-side feedback enforcement (belt-and-suspenders; DB also validates)
  if ((status === 'rejected' || status === 'changes_requested') && !feedback?.trim()) {
    return { error: 'Moderator feedback is required for rejection or revision requests.' }
  }

  const { artworkId: validId, status: validStatus, feedback: validFeedback } = validation.data
  const trimmedFeedback = validFeedback?.trim() || null

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // 3. Verify admin role
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Forbidden: Admin access required' }
  }

  // 4. ──────────────────────────────────────────────────────────────────────
  //    ATOMIC STATE MACHINE: Execute only the artwork status UPDATE via RPC.
  //    The RPC uses FOR UPDATE (row lock) and validates the state machine.
  //    No INSERTs happen inside the RPC — this guarantees it commits.
  // ──────────────────────────────────────────────────────────────────────────
  const { data: rpcResult, error: rpcError } = await supabase.rpc('moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status:     validStatus,
    p_admin_id:   user.id,
    p_reason:     trimmedFeedback,
  })

  if (rpcError) {
    // The state machine raised an exception (invalid transition, missing feedback, etc.)
    console.error('[moderateArtwork] RPC error:', rpcError.message)
    return { error: rpcError.message }
  }

  // RPC committed — artwork status is now updated in the database.
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

  // 5. ──────────────────────────────────────────────────────────────────────
  //    SIDE EFFECTS: Run as authenticated client (correct RLS role).
  //    These are best-effort — if they fail, the main update is already done.
  // ──────────────────────────────────────────────────────────────────────────

  // 5a. Audit log
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

  // 5b. Notification for the artist
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

  // 6. Cache invalidation — runs AFTER the DB commit
  revalidateAll(exhibitionId, artistId)

  return { success: true, result }
}

// ─────────────────────────────────────────────────────────────────────────────
// resubmitArtwork — Artist submits revised artwork (changes_requested → pending)
// ─────────────────────────────────────────────────────────────────────────────
export async function resubmitArtwork(
  artworkId: string,
  updates: {
    description_en?: string
    description_bn?: string
    medium_en?: string
    medium_bn?: string
    dimensions?: string
    main_image_url?: string
    price?: number | null
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Apply field updates before transition (only if status = changes_requested)
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined && v !== '')
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

  // Transition via RPC (validates ownership + state, then changes_requested → pending)
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
