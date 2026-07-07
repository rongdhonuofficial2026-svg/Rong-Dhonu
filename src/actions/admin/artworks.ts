'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateArtworkSchema } from "@/lib/validations/schemas"

// ─────────────────────────────────────────────────────────────────────────────
// Helper: revalidate every page that shows artwork status
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

  // 2. Enforce feedback requirement for rejection and revision
  if ((status === 'rejected' || status === 'changes_requested') && !feedback?.trim()) {
    return { error: 'Moderator feedback is required for rejection or revision requests.' }
  }

  const { artworkId: validId, status: validStatus, feedback: validFeedback } = validation.data

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

  // 4. Execute the transactional RPC (validates state machine, updates status + feedback + audit + notification)
  const { data: rpcResult, error: rpcError } = await supabase.rpc('moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status:     validStatus,
    p_admin_id:   user.id,
    p_reason:     validFeedback || null,
  })

  if (rpcError) {
    // Return the database-level error message (includes state machine validation messages)
    return { error: rpcError.message }
  }

  // 5. Extract IDs from RPC result for targeted cache invalidation
  const result = rpcResult as { exhibition_id?: string; artist_id?: string } | null
  revalidateAll(result?.exhibition_id, result?.artist_id)

  return { success: true, result }
}

// ─────────────────────────────────────────────────────────────────────────────
// resubmitArtwork — Artist submits a revised artwork (changes_requested → pending)
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

  // Apply any field updates before calling the resubmit RPC
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', artworkId)
      .eq('artist_id', user.id)
      .eq('status', 'changes_requested') // only allow edits in changes_requested state

    if (updateError) return { error: updateError.message }
  }

  // Transition status changes_requested → pending via RPC
  const { error: rpcError } = await supabase.rpc('resubmit_artwork', {
    p_artwork_id: artworkId,
    p_artist_id:  user.id,
  })

  if (rpcError) return { error: rpcError.message }

  // Fetch the artwork to get exhibition_id for targeted revalidation
  const { data: artwork } = await supabase
    .from('artworks')
    .select('exhibition_id')
    .eq('id', artworkId)
    .single()

  revalidateAll(artwork?.exhibition_id, user.id)

  return { success: true }
}
