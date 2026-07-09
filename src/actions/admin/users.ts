'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

// Helper to check admin/owner permissions
async function checkAdminPermission(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: Not logged in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
    throw new Error('Unauthorized: Insufficient permissions')
  }

  return user.id
}

export async function getUsers(params: {
  search?: string
  role?: string
  status?: string
  is_verified?: boolean
  sort?: string
  page?: number
  limit?: number
}) {
  try {
    const supabase = await createClient()
    const actorId = await checkAdminPermission(supabase)

    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name_en,
        full_name_bn,
        email,
        slug,
        role,
        status,
        is_verified,
        created_at,
        last_login,
        avatar_url,
        phone,
        artworks:artworks!artworks_artist_id_fkey(id),
        exhibition_participants:exhibition_participants!exhibition_participants_artist_id_fkey(exhibition_id),
        gallery_media:gallery_media!gallery_media_uploaded_by_fkey(id),
        catalogs:catalogs!catalogs_published_by_fkey(id)
      `, { count: 'exact' })

    // Search filter
    if (params.search) {
      const q = params.search.trim()
      query = query.or(`full_name_en.ilike.%${q}%,email.ilike.%${q}%,slug.ilike.%${q}%`)
    }

    // Role filter
    if (params.role && params.role !== 'all') {
      query = query.eq('role', params.role)
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    // Verification filter
    if (params.is_verified !== undefined) {
      query = query.eq('is_verified', params.is_verified)
    }

    // Sort order
    if (params.sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (params.sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (params.sort === 'name') {
      query = query.order('full_name_en', { ascending: true })
    } else if (params.sort === 'last_login') {
      query = query.order('last_login', { ascending: false, nullsFirst: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, count, error } = await query

    if (error) {
      console.error('getUsers database error:', error)
      return { success: false, error: error.message }
    }

    const processedUsers = (data || []).map((user: any) => {
      const artworksCount = user.artworks?.length || 0
      const exhibitionsCount = user.exhibition_participants?.length || 0
      const galleryCount = user.gallery_media?.length || 0
      const catalogsCount = user.catalogs?.length || 0

      return {
        ...user,
        artworksCount,
        exhibitionsCount,
        galleryCount,
        catalogsCount
      }
    })

    // Custom sort in JS for relation count sorting if requested
    if (params.sort === 'most_artworks') {
      processedUsers.sort((a, b) => b.artworksCount - a.artworksCount)
    }

    // Apply pagination in JS if we did custom sorting, or slice the range
    const page = params.page || 1
    const limit = params.limit || 12
    const totalCount = count || processedUsers.length
    
    const paginatedUsers = processedUsers.slice((page - 1) * limit, page * limit)

    return {
      success: true,
      users: paginatedUsers,
      totalCount,
      page,
      limit
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getUserById(id: string) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name_en,
        full_name_bn,
        email,
        slug,
        role,
        status,
        is_verified,
        created_at,
        last_login,
        avatar_url,
        phone,
        bio_en,
        bio_bn,
        social_links,
        awards,
        website_url,
        instagram_url
      `)
      .eq('id', id)
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, user }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getUserDashboard(id: string) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    // Parallel fetch secondary tabs to avoid N+1 queries and lazy load on client
    const [artworksRes, galleryRes, exhibitionsRes, catalogsRes, notificationsRes, auditLogsRes] = await Promise.all([
      // 1. Artworks
      supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', id)
        .order('created_at', { ascending: false }),

      // 2. Gallery Uploads
      supabase
        .from('gallery_media')
        .select(`
          *,
          gallery_albums:gallery_album_id (
            title_en,
            slug
          )
        `)
        .eq('uploaded_by', id)
        .order('created_at', { ascending: false }),

      // 3. Exhibition History
      supabase
        .from('exhibition_participants')
        .select(`
          *,
          exhibitions!exhibition_participants_exhibition_id_fkey (
            id,
            theme_en,
            theme_bn,
            year,
            status
          )
        `)
        .eq('artist_id', id)
        .order('created_at', { ascending: false }),

      // 4. Catalog Contributions
      supabase
        .from('catalogs')
        .select('*')
        .eq('published_by', id)
        .order('created_at', { ascending: false }),

      // 5. Notifications history
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(30),

      // 6. Audit & Login history
      supabase
        .from('audit_logs')
        .select('*')
        .eq('actor_id', id)
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    const artworks = artworksRes.data || []
    const gallery = galleryRes.data || []
    const exhibitions = exhibitionsRes.data || []
    const catalogs = catalogsRes.data || []
    const notifications = notificationsRes.data || []
    const auditLogs = auditLogsRes.data || []

    // Compute statistics aggregates
    const stats = {
      artworksSubmitted: artworks.length,
      artworksApproved: artworks.filter(a => a.status === 'approved').length,
      artworksPending: artworks.filter(a => a.status === 'pending').length,
      artworksRejected: artworks.filter(a => a.status === 'rejected').length,
      galleryUploads: gallery.length,
      exhibitionsParticipated: exhibitions.filter(e => e.status === 'approved').length,
      catalogContributions: catalogs.length,
      totalDownloads: catalogs.reduce((acc, c) => acc + (c.total_downloads || 0), 0),
      loginCount: auditLogs.filter(log => log.action === 'login' || log.action === 'user_login').length,
      lastActivity: auditLogs[0]?.created_at || null
    }

    return {
      success: true,
      artworks,
      gallery,
      exhibitions,
      catalogs,
      notifications,
      auditLogs,
      stats
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateUserProfile(id: string, updates: any) {
  try {
    const supabase = await createClient()
    const actorId = await checkAdminPermission(supabase)

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAudit('update_profile_by_admin', 'profiles', id, { updates })
    
    revalidatePath('/admin/users')
    return { success: true, user: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function changeUserRole(id: string, role: 'admin' | 'member' | 'committee' | 'owner') {
  try {
    const supabase = await createClient()
    const actorId = await checkAdminPermission(supabase)

    // Check if actor is transferring ownership (only owner can assign owner role)
    if (role === 'owner') {
      const { data: actor } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', actorId)
        .single()
      
      if (!actor || actor.role !== 'owner') {
        return { success: false, error: 'Only the current Owner can transfer ownership.' }
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAudit('change_user_role', 'profiles', id, { new_role: role })
    
    revalidatePath('/admin/users')
    return { success: true, user: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function suspendUser(id: string) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'suspended' })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAudit('suspend_user', 'profiles', id, {})

    revalidatePath('/admin/users')
    return { success: true, user: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function reactivateUser(id: string) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAudit('reactivate_user', 'profiles', id, {})

    revalidatePath('/admin/users')
    return { success: true, user: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function approveUser(id: string) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active', is_verified: true })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAudit('approve_user', 'profiles', id, {})

    // Send a notification in app
    await supabase.from('notifications').insert({
      user_id: id,
      type: 'registration_approved',
      message_en: 'Your Rongdhono account registration has been approved. Welcome to the network!',
      message_bn: 'আপনার রঙধনু অ্যাকাউন্ট নিবন্ধন অনুমোদিত হয়েছে। নেটওয়ার্কে স্বাগতম!',
      read_status: false
    })

    revalidatePath('/admin/users')
    return { success: true, user: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteUser(id: string) {
  try {
    const supabase = await createClient()
    const actorId = await checkAdminPermission(supabase)

    if (id === actorId) {
      return { success: false, error: 'You cannot delete your own account.' }
    }

    // Delete user from profiles (CASCADE constraints will handle cleanup)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    await logAudit('delete_user_by_admin', 'profiles', id, {})

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function sendNotificationToUser(userId: string, payload: { message_en: string; message_bn?: string; type?: string }) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: payload.type || 'deadline_reminder',
        message_en: payload.message_en,
        message_bn: payload.message_bn || payload.message_en,
        read_status: false
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAudit('send_notification_by_admin', 'notifications', data.id, { userId })
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function adminDeleteArtwork(artworkId: string) {
  try {
    const supabase = await createClient()
    await checkAdminPermission(supabase)

    // First fetch artwork to log it
    const { data: artwork } = await supabase
      .from('artworks')
      .select('title_en, artist_id, main_image_url')
      .eq('id', artworkId)
      .single()

    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId)

    if (error) return { success: false, error: error.message }

    // Try deleting image from storage if it exists
    if (artwork?.main_image_url) {
      try {
        const urlObj = new URL(artwork.main_image_url)
        const pathParts = urlObj.pathname.split('/artworks/')
        if (pathParts.length === 2) {
          await supabase.storage.from('artworks').remove([pathParts[1]])
        }
      } catch (e) {
        // ignore storage deletion error
      }
    }

    await logAudit('delete_artwork_by_admin', 'artwork', artworkId, { title: artwork?.title_en })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

