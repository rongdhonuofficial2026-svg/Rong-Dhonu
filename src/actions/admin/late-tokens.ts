'use server'

/**
 * Server actions for admin-managed late submission tokens.
 *
 * Security model:
 *  - Only SHA-256(raw_token) is stored in the database.
 *  - The raw token is returned once at creation and never stored again.
 *  - Validation uses a SECURITY DEFINER RPC so no table-level SELECT grant
 *    is needed for regular authenticated users.
 *  - Every action is gated by requireAdmin() before touching the DB.
 */

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canAccessAdmin } from '@/lib/auth/roles'

// ── Internals ─────────────────────────────────────────────────────────────────

function sha256Hex(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

async function requireAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !canAccessAdmin(profile.role)) throw new Error('Forbidden')
  return user
}

// ── Public actions ─────────────────────────────────────────────────────────────

export interface LateTokenRecord {
  id: string
  label: string | null
  created_at: string
  expires_at: string | null
  revoked_at: string | null
  used_count: number
  max_uses: number | null
}

/**
 * Generates a new cryptographically secure late-submission token for an exhibition.
 *
 * Returns `rawToken` — this is the only time the plaintext token is available.
 * Store it or give it to the participant immediately; it cannot be recovered later.
 */
export async function generateLateSubmissionToken(
  exhibitionId: string,
  options: {
    label?: string
    /** Hours until the link expires. Pass undefined/null for no expiry. */
    expiresInHours?: number | null
    /** Max number of times the link can open the submission form. null = unlimited. */
    maxUses?: number | null
  } = {}
) {
  try {
    const supabase = await createClient()
    const user = await requireAdminUser(supabase)

    // Verify exhibition is in a state that can accept late submissions
    const { data: exh } = await supabase
      .from('exhibitions')
      .select('id, status, theme_en')
      .eq('id', exhibitionId)
      .neq('is_deleted', true)
      .single()

    if (!exh) return { error: 'Exhibition not found.' }
    if (exh.status === 'draft') {
      return { error: 'The exhibition must be published (Upcoming or Ongoing) before generating late submission links.' }
    }
    // Allow for archived too — admin may need to reopen for a short window
    // But we show a warning in the UI; the server allows it.

    // Generate 32 random bytes → URL-safe base64 (43 chars, no padding)
    const rawToken = crypto.randomBytes(32).toString('base64url')
    const tokenHash = sha256Hex(rawToken)

    const expiresAt = options.expiresInHours
      ? new Date(Date.now() + options.expiresInHours * 3_600_000).toISOString()
      : null

    const { data, error } = await supabase
      .from('late_submission_tokens')
      .insert({
        exhibition_id: exhibitionId,
        token_hash: tokenHash,
        label: options.label?.trim() || null,
        created_by: user.id,
        expires_at: expiresAt,
        max_uses: options.maxUses ?? null,
      })
      .select('id')
      .single()

    if (error) return { error: `Failed to create token: ${error.message}` }

    revalidatePath(`/en/admin/exhibitions/${exhibitionId}`)
    revalidatePath(`/bn/admin/exhibitions/${exhibitionId}`)

    return { success: true, tokenId: data.id as string, rawToken }
  } catch (err: any) {
    return { error: err.message }
  }
}

/**
 * Revokes a late submission token. Once revoked, the link is permanently disabled.
 */
export async function revokeLateSubmissionToken(tokenId: string, exhibitionId: string) {
  try {
    const supabase = await createClient()
    await requireAdminUser(supabase)

    const { error } = await supabase
      .from('late_submission_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', tokenId)
      .is('revoked_at', null)

    if (error) return { error: error.message }

    revalidatePath(`/en/admin/exhibitions/${exhibitionId}`)
    revalidatePath(`/bn/admin/exhibitions/${exhibitionId}`)

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

/**
 * Lists all late submission tokens for an exhibition (admin only).
 * Raw tokens are NOT returned — only metadata.
 */
export async function getLateSubmissionTokens(exhibitionId: string): Promise<{
  tokens: LateTokenRecord[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    await requireAdminUser(supabase)

    const { data, error } = await supabase
      .from('late_submission_tokens')
      .select('id, label, created_at, expires_at, revoked_at, used_count, max_uses')
      .eq('exhibition_id', exhibitionId)
      .order('created_at', { ascending: false })

    if (error) return { tokens: [], error: error.message }
    return { tokens: (data as LateTokenRecord[]) || [] }
  } catch (err: any) {
    return { tokens: [], error: err.message }
  }
}

/**
 * Validates a raw bearer token server-side (no admin required — called during submission).
 *
 * Uses the `validate_and_use_late_token` SECURITY DEFINER RPC so that regular
 * authenticated users never need SELECT/UPDATE access on the token table.
 *
 * @param rawToken   The plaintext token from the URL parameter.
 * @param exhibitionId  The exhibition ID from the URL parameter.
 * @returns { valid: true } or { valid: false, error: string }
 */
export async function validateLateTokenForSubmission(
  rawToken: string,
  exhibitionId: string
): Promise<{ valid: boolean; error?: string }> {
  if (!rawToken || !exhibitionId) {
    return { valid: false, error: 'Missing token or exhibition.' }
  }

  // Sanitise: rawToken must look like a base64url string (43 chars, no padding)
  if (!/^[A-Za-z0-9_\-]{40,60}$/.test(rawToken)) {
    return { valid: false, error: 'Invalid token format.' }
  }

  try {
    const supabase = await createClient()
    const tokenHash = sha256Hex(rawToken)

    // Call the SECURITY DEFINER function — atomically validates AND increments used_count
    const { data, error } = await supabase
      .rpc('validate_and_use_late_token', {
        p_token_hash: tokenHash,
        p_exhibition_id: exhibitionId,
      })

    if (error) {
      console.error('[LateToken] RPC error:', error)
      return { valid: false, error: 'Token validation failed.' }
    }

    if (!data) {
      return { valid: false, error: 'This late submission link is invalid, expired, or has been revoked.' }
    }

    return { valid: true }
  } catch (err: any) {
    console.error('[LateToken] validateLateTokenForSubmission error:', err)
    return { valid: false, error: 'Token validation failed.' }
  }
}
