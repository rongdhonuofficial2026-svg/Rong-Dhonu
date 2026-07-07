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
  if (!profile || profile.role !== 'admin') {
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

  // Use the transactional RPC to update status, audit log, and notify the artist
  const { error: rpcError } = await supabase.rpc('moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status: validStatus,
    p_admin_id: user.id,
    p_reason: validFeedback || null,
  })

  if (rpcError) return { error: rpcError.message }

  revalidatePath('/[locale]/(admin)/admin/exhibitions/[id]/moderation', 'page')
  revalidatePath('/[locale]/(admin)/admin/artworks', 'page')
  revalidatePath('/[locale]/(public)/gallery', 'page')
  revalidatePath('/', 'layout') // Revalidate entire app to update Homepage Featured Artists and Exhibition Counts
  return { success: true }
}
