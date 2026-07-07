'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { SupabaseClient, User } from "@supabase/supabase-js"
import { createNotification } from "@/actions/notifications"
import { logAudit } from "@/lib/audit"
import { moderateArtworkSchema } from "@/lib/validations/schemas"

// Validate admin helper
async function requireAdmin(supabase: SupabaseClient, user: User | null): Promise<void> {
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin', 'committee'].includes(profile.role)) {
    throw new Error('Forbidden: Admin access required')
  }
}

export async function moderateArtwork(
  artworkId: string,
  status: 'approved' | 'rejected' | 'changes_requested',
  feedback?: string
) {
  // Validate inputs with Zod
  const validation = moderateArtworkSchema.safeParse({ artworkId, status, feedback })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { artworkId: validId, status: validStatus, feedback: validFeedback } = validation.data

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  try {
    await requireAdmin(supabase, user)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden' }
  }

  // Map changes_requested → keep 'pending' status in DB, but track notes
  const dbStatus = validStatus === 'changes_requested' ? 'pending' : validStatus

  const { data: artwork, error: updateError } = await supabase
    .from('artworks')
    .update({
      status: dbStatus,
      notes: validFeedback || null,
    })
    .eq('id', validId)
    .select('id, title_en, title_bn, artist_id')
    .single()

  if (updateError) return { error: updateError.message }

  // Audit log
  const auditAction = validStatus === 'approved' ? 'approve_artwork' : 'reject_artwork'
  await logAudit(auditAction, 'artwork', validId, { feedback: validFeedback, status: validStatus })

  // Notification
  const notifType =
    validStatus === 'approved'
      ? 'submission_approved'
      : validStatus === 'rejected'
      ? 'submission_rejected'
      : 'submission_received'

  const msgEn = validFeedback
    ? `Your artwork "${artwork.title_en}" has been ${validStatus}. Feedback: ${validFeedback}`
    : `Your artwork "${artwork.title_en}" has been ${validStatus}.`

  const msgBn = validFeedback
    ? `আপনার শিল্পকর্ম "${artwork.title_bn || artwork.title_en}" ${validStatus} হয়েছে। মন্তব্য: ${validFeedback}`
    : `আপনার শিল্পকর্ম "${artwork.title_bn || artwork.title_en}" ${validStatus} হয়েছে।`

  await createNotification(artwork.artist_id, notifType, msgEn, msgBn, {
    subject: `Rongdhonu: Artwork ${validStatus}`,
    html: `<p>Hello,</p><p>Your artwork <strong>${artwork.title_en}</strong> has been marked as <strong>${validStatus}</strong>.</p>${validFeedback ? `<p><strong>Feedback:</strong> ${validFeedback}</p>` : ''}`,
    category: 'notify_artwork_updates',
  })

  revalidatePath('/[locale]/(admin)/admin/artworks', 'page')
  revalidatePath('/[locale]/(public)/gallery', 'page')
  revalidatePath('/', 'layout') // Revalidate entire app to update Homepage Featured Artists and Exhibition Counts
  return { success: true }
}
