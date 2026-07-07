'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateArtworkSchema } from "@/lib/validations/schemas"

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

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Forbidden: Admin access required' }
  }

  // Use the transactional RPC to update status, audit log, and notify the artist
  const { error: rpcError } = await supabase.rpc('moderate_artwork_transaction', {
    p_artwork_id: validId,
    p_status: validStatus,
    p_admin_id: user.id,
    p_reason: validFeedback || null,
  })

  if (rpcError) return { error: rpcError.message }

  // Broad revalidation so all UIs update immediately
  revalidatePath(`/en/admin/exhibitions`)
  revalidatePath(`/bn/admin/exhibitions`)
  revalidatePath(`/en/admin/artworks`)
  revalidatePath(`/bn/admin/artworks`)
  revalidatePath(`/en/gallery`)
  revalidatePath(`/bn/gallery`)
  revalidatePath(`/en`)
  revalidatePath(`/bn`)
  revalidatePath(`/en/dashboard/artworks`)
  revalidatePath(`/bn/dashboard/artworks`)

  return { success: true }
}
