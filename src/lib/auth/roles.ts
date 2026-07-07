import { SupabaseClient } from '@supabase/supabase-js'

export type UserRole = 'owner' | 'admin' | 'member' | 'guest'

/**
 * Resolves the canonical dashboard route based on user role.
 */
export function resolveDashboardRoute(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'owner':
    case 'admin':
      return '/admin'
    case 'member':
      return '/dashboard'
    default:
      return '/login'
  }
}

/**
 * Safely fetches a user's profile role, self-healing the profile if missing (for owner).
 * For Edge environment (middleware), we just fetch.
 */
export async function getUserRole(supabase: SupabaseClient, userId: string, userEmail?: string): Promise<UserRole> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role) {
    return profile.role as UserRole
  }

  // If no profile exists, but we know it's the owner email, assume owner (will be healed on loginAction)
  if (userEmail === 'rongdhonuofficial2026@gmail.com') {
    return 'owner'
  }

  return 'member'
}

/**
 * Validates if the user has permission to access the admin dashboard.
 */
export function canAccessAdmin(role: UserRole | string | null | undefined): boolean {
  return role === 'owner' || role === 'admin'
}
