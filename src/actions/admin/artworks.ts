'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateArtworkSchema } from "@/lib/validations/schemas"
import { canAccessAdmin } from "@/lib/auth/roles"

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG LOGGER — structured, timestamped, step-numbered
// Remove after root cause is confirmed.
// ─────────────────────────────────────────────────────────────────────────────
function log(step: number, label: string, data?: unknown) {
  const ts = new Date().toISOString()
  console.log(`\n[MODERATION-DEBUG][${ts}] STEP ${step}: ${label}`)
  if (data !== undefined) {
    try {
      console.log(JSON.stringify(data, null, 2))
    } catch {
      console.log(String(data))
    }
  }
}

function logError(step: number, label: string, err: unknown) {
  const ts = new Date().toISOString()
  console.error(`\n[MODERATION-DEBUG][${ts}] STEP ${step} ERROR: ${label}`)
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    console.error(JSON.stringify({
      message:  e.message,
      code:     e.code,
      hint:     e.hint,
      details:  e.details,
      status:   e.status,
      statusText: e.statusText,
    }, null, 2))
  } else {
    console.error(String(err))
  }
}

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
// moderateArtwork — FULLY INSTRUMENTED DEBUG VERSION
// ─────────────────────────────────────────────────────────────────────────────
export async function moderateArtwork(
  artworkId: string,
  status: 'approved' | 'rejected' | 'changes_requested',
  feedback?: string
) {
  log(1, 'SERVER ACTION STARTED', { artworkId, status, feedbackLength: feedback?.length ?? 0 })

  // ── Step 2: Schema validation ──────────────────────────────────────────────
  const validation = moderateArtworkSchema.safeParse({ artworkId, status, feedback })
  if (!validation.success) {
    logError(2, 'ZOD VALIDATION FAILED', validation.error.issues[0])
    return { error: validation.error.issues[0].message }
  }
  log(2, 'ZOD VALIDATION PASSED', { artworkId, status })

  // ── Step 3: Client-side feedback guard ────────────────────────────────────
  if ((status === 'rejected' || status === 'changes_requested') && !feedback?.trim()) {
    log(3, 'FEEDBACK GUARD BLOCKED — feedback required but missing')
    return { error: 'Moderator feedback is required for rejection or revision requests.' }
  }
  log(3, 'FEEDBACK GUARD PASSED')

  const { artworkId: validId, status: validStatus, feedback: validFeedback } = validation.data
  const trimmedFeedback = validFeedback?.trim() || null

  // ── Step 4: Auth ───────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    logError(4, 'AUTH FAILED', authError)
    return { error: 'Unauthorized' }
  }
  log(4, 'AUTH PASSED', { userId: user.id, email: user.email })

  // ── Step 5: Admin role check ───────────────────────────────────────────────
  const { data: adminProfile, error: roleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // is_admin() in the DB grants access to role IN ('admin', 'owner')
  // (see migration 20260705000003_add_owner_role.sql)
  // Use the canonical canAccessAdmin() helper which mirrors this exactly.
  if (roleError || !adminProfile || !canAccessAdmin(adminProfile.role)) {
    logError(5, 'ROLE CHECK FAILED', { roleError, role: adminProfile?.role })
    return { error: 'Forbidden: Admin access required' }
  }
  log(5, 'ROLE CHECK PASSED', { role: adminProfile.role })

  // ── Step 6: Pre-RPC database state ────────────────────────────────────────
  const { data: prePRC, error: preRpcError } = await supabase
    .from('artworks')
    .select('id, status, updated_at')
    .eq('id', validId)
    .single()
  log(6, 'PRE-RPC DATABASE STATE', { data: prePRC, error: preRpcError?.message })

  // ── Step 7: RPC call ───────────────────────────────────────────────────────
  log(7, 'CALLING RPC: moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status:     validStatus,
    p_admin_id:   user.id,
    p_reason:     trimmedFeedback,
  })

  const { data: rpcResult, error: rpcError } = await supabase.rpc('moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status:     validStatus,
    p_admin_id:   user.id,
    p_reason:     trimmedFeedback,
  })

  if (rpcError) {
    logError(7, 'RPC RETURNED ERROR', rpcError)
    return { error: rpcError.message }
  }
  log(7, 'RPC RETURNED SUCCESS', rpcResult)

  // ── Step 8: Post-RPC database verification ────────────────────────────────
  const { data: postRPC, error: postRpcError } = await supabase
    .from('artworks')
    .select('id, status, updated_at, approved_at, approved_by, moderator_feedback')
    .eq('id', validId)
    .single()
  log(8, 'POST-RPC DATABASE STATE (ground truth)', {
    data: postRPC,
    error: postRpcError?.message,
    statusChangedSuccessfully: postRPC?.status === validStatus,
  })

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

  const { error: auditError } = await supabase.from('audit_logs').insert({
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
  if (auditError) {
    logError(9, 'AUDIT LOG INSERT FAILED', auditError)
  } else {
    log(9, 'AUDIT LOG INSERT SUCCESS')
  }

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
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id:    artistId,
      type:       notifType,
      message_en: notifMsgEn,
      message_bn: notifMsgBn,
    })
    if (notifError) {
      logError(10, 'NOTIFICATION INSERT FAILED', notifError)
    } else {
      log(10, 'NOTIFICATION INSERT SUCCESS', { artistId, notifType })
    }
  } else {
    log(10, 'NOTIFICATION SKIPPED — no artistId from RPC result')
  }

  // ── Step 11: Cache revalidation ───────────────────────────────────────────
  const revalidated = revalidateAll(exhibitionId, artistId)
  log(11, 'CACHE REVALIDATED', { count: revalidated.length, paths: revalidated })

  // ── Step 12: Final response ───────────────────────────────────────────────
  const finalResponse = {
    success: true,
    debug: {
      requestedStatus:  validStatus,
      preRpcStatus:     prePRC?.status,
      postRpcStatus:    postRPC?.status,
      statusCommitted:  postRPC?.status === validStatus,
      rpcResult:        rpcResult,
    }
  }
  log(12, 'RETURNING TO CLIENT', finalResponse)

  return finalResponse
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
