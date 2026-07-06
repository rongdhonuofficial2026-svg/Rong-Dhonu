import { SupabaseClient } from '@supabase/supabase-js'
import type {
  DashboardData,
  DashboardKPIs,
  AuditLogWithProfile,
  ArtworkWithArtistAndImage,
  CommitteeMemberFull,
} from '@/types/dashboard'
import { safeData, safeCount } from '@/types/dashboard'

/**
 * Fetches ALL data required for the Admin Overview Dashboard in a single
 * parallel batch. Uses Promise.allSettled so a single failed query never
 * crashes the page — each section degrades gracefully.
 */
export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const now = new Date().toISOString()
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString()

  const [
    r_currentUser,
    r_activeExhibition,
    // ── KPI count queries (head:true = zero row transfer) ──
    r_totalArtists,
    r_newArtistsThisMonth,
    r_totalArtworks,
    r_pendingArtworks,
    r_approvedArtworks,
    r_rejectedArtworks,
    r_totalExhibitions,
    r_activeExhibitions,
    r_totalCommitteeMembers,
    r_publishedCatalogs,
    r_draftCatalogs,
    r_totalGallery,
    r_unreadNotifications,
    r_pendingParticipants,
    r_totalAdmins,
    r_totalCommitteeUsers,
    // ── Data arrays ──
    r_recentAudits,
    r_pendingArtworkList,
    r_recentArtists,
    r_recentArtworks,
    r_committeeMembers,
    r_upcomingEvents,
    r_notifications,
    r_catalogStats,
    r_galleryStats,
    r_cmsSections,
  ] = await Promise.allSettled([

    // Current admin profile
    supabase
      .from('profiles')
      .select('id, full_name_en, role, avatar_url, email')
      .eq('id', userId)
      .single(),

    // Active exhibition (most recent, not archived)
    supabase
      .from('exhibitions')
      .select('*')
      .not('status', 'eq', 'archived')
      .order('exhibition_start', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // KPI: Total artists (role = member)
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),

    // KPI: New artists this month
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'member').gte('created_at', monthStart),

    // KPI: Total artworks
    supabase.from('artworks').select('*', { count: 'exact', head: true }),

    // KPI: Pending artworks
    supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

    // KPI: Approved artworks
    supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('status', 'approved'),

    // KPI: Rejected artworks
    supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),

    // KPI: Total exhibitions
    supabase.from('exhibitions').select('*', { count: 'exact', head: true }),

    // KPI: Active exhibitions (non-draft, non-archived)
    supabase.from('exhibitions').select('*', { count: 'exact', head: true })
      .in('status', ['registration_open', 'submission_open', 'submission_closed', 'reviewing', 'published']),

    // KPI: Total committee members (across all exhibitions)
    supabase.from('committee_members').select('*', { count: 'exact', head: true }),

    // KPI: Published catalogs
    supabase.from('catalogs').select('*', { count: 'exact', head: true }).eq('status', 'published'),

    // KPI: Draft catalogs
    supabase.from('catalogs').select('*', { count: 'exact', head: true }).eq('status', 'draft'),

    // KPI: Total gallery media
    supabase.from('gallery_media').select('*', { count: 'exact', head: true }),

    // KPI: Unread notifications for this admin
    supabase.from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('read_status', false),

    // KPI: Pending exhibition participants
    supabase.from('exhibition_participants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

    // KPI: Users with admin/owner role
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),

    // KPI: Users with committee role
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'committee'),

    // Activity: Recent audit logs with actor name
    supabase
      .from('audit_logs')
      .select('id, actor_id, action, entity_type, entity_id, created_at, profiles!actor_id(full_name_en, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(15),

    // Pending: Artworks awaiting moderation (for Pending Actions panel)
    supabase
      .from('artworks')
      .select('id, title_en, medium_en, category, created_at, artist_id, status, profiles!artist_id(full_name_en), artwork_images(url_thumbnail, order_index)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(6),

    // Recent artists (for artists panel)
    supabase
      .from('profiles')
      .select('id, full_name_en, bio_en, avatar_url, created_at, slug')
      .eq('role', 'member')
      .order('created_at', { ascending: false })
      .limit(6),

    // Recent artworks (for artworks panel)
    supabase
      .from('artworks')
      .select('id, title_en, medium_en, category, status, created_at, artist_id, profiles!artist_id(full_name_en), artwork_images(url_thumbnail, order_index)')
      .order('created_at', { ascending: false })
      .limit(6),

    // Committee members with profile + exhibition info
    supabase
      .from('committee_members')
      .select('id, role_en, year, created_at, profiles!profile_id(full_name_en, avatar_url), exhibitions!exhibition_id(theme_en, year)')
      .order('created_at', { ascending: false })
      .limit(8),

    // Upcoming events (future only)
    supabase
      .from('events')
      .select('id, title_en, date_time, description_en, speaker_en')
      .gte('date_time', now)
      .order('date_time', { ascending: true })
      .limit(5),

    // Admin notifications (scoped to current user only)
    supabase
      .from('notifications')
      .select('id, type, message_en, read_status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(8),

    // Catalog status for breakdown widget
    supabase.from('catalogs').select('status, total_downloads'),

    // Gallery media type breakdown
    supabase
      .from('gallery_media')
      .select('media_type, created_at')
      .order('created_at', { ascending: false }),

    // CMS sections
    supabase.from('cms_content').select('page, section, updated_at'),
  ])

  // ─── Unwrap counts ─────────────────────────────────────────────────────────
  const totalArtists        = safeCount(r_totalArtists as any)
  const newArtistsThisMonth = safeCount(r_newArtistsThisMonth as any)
  const totalArtworks       = safeCount(r_totalArtworks as any)
  const pendingArtworks     = safeCount(r_pendingArtworks as any)
  const approvedArtworks    = safeCount(r_approvedArtworks as any)
  const rejectedArtworks    = safeCount(r_rejectedArtworks as any)
  const totalExhibitions    = safeCount(r_totalExhibitions as any)
  const activeExhibitions   = safeCount(r_activeExhibitions as any)
  const totalCommitteeMembers = safeCount(r_totalCommitteeMembers as any)
  const publishedCatalogs   = safeCount(r_publishedCatalogs as any)
  const draftCatalogs       = safeCount(r_draftCatalogs as any)
  const totalGalleryMedia   = safeCount(r_totalGallery as any)
  const unreadNotifications = safeCount(r_unreadNotifications as any)
  const pendingParticipants = safeCount(r_pendingParticipants as any)
  const totalAdmins         = safeCount(r_totalAdmins as any)
  const totalCommitteeUsers = safeCount(r_totalCommitteeUsers as any)

  // ─── Unwrap data arrays ────────────────────────────────────────────────────
  const recentAudits      = safeData(r_recentAudits as any, []) as AuditLogWithProfile[]
  const pendingArtworkList = safeData(r_pendingArtworkList as any, []) as ArtworkWithArtistAndImage[]
  const recentArtists     = safeData(r_recentArtists as any, [])
  const recentArtworks    = safeData(r_recentArtworks as any, []) as ArtworkWithArtistAndImage[]
  const committeeMembers  = safeData(r_committeeMembers as any, []) as CommitteeMemberFull[]
  const upcomingEvents    = safeData(r_upcomingEvents as any, [])
  const recentNotifications = safeData(r_notifications as any, [])
  const catalogRaw        = safeData(r_catalogStats as any, []) as { status: string; total_downloads: number | null }[]
  const galleryRaw        = safeData(r_galleryStats as any, []) as { media_type: 'image' | 'video'; created_at: string }[]
  const cmsSections       = safeData(r_cmsSections as any, [])
  const currentUser       = safeData(r_currentUser as any, {
    id: userId,
    full_name_en: 'Administrator',
    role: 'admin' as const,
    avatar_url: null,
    email: '',
  })
  const activeExhibition  = safeData(r_activeExhibition as any, null)

  // ─── Derived values ────────────────────────────────────────────────────────
  const totalDecided = approvedArtworks + rejectedArtworks
  const approvalRate = totalDecided > 0 ? Math.round((approvedArtworks / totalDecided) * 100) : 0

  const catalogStatusBreakdown = {
    published: catalogRaw.filter(c => c.status === 'published').length,
    draft:     catalogRaw.filter(c => c.status === 'draft').length,
    archived:  catalogRaw.filter(c => c.status === 'archived').length,
  }

  const totalCatalogDownloads = catalogRaw.reduce(
    (sum, c) => sum + (c.total_downloads ?? 0), 0
  )

  const galleryImages  = galleryRaw.filter(m => m.media_type === 'image').length
  const galleryVideos  = galleryRaw.filter(m => m.media_type === 'video').length
  const galleryLastUpload = galleryRaw.length > 0 ? galleryRaw[0].created_at : null

  const kpis: DashboardKPIs = {
    totalArtists,
    newArtistsThisMonth,
    totalArtworks,
    pendingArtworks,
    approvedArtworks,
    rejectedArtworks,
    totalExhibitions,
    activeExhibitions,
    totalCommitteeMembers,
    publishedCatalogs,
    draftCatalogs,
    totalCatalogDownloads,
    totalGalleryMedia,
    totalImages: galleryImages,
    totalVideos: galleryVideos,
    unreadNotifications,
    pendingParticipants,
    totalAdmins,
    totalCommitteeUsers,
    approvalRate,
  }

  return {
    currentUser: currentUser as DashboardData['currentUser'],
    activeExhibition,
    kpis,
    recentAudits,
    pendingArtworkList,
    recentArtists: recentArtists as DashboardData['recentArtists'],
    recentArtworks,
    committeeMembers,
    upcomingEvents: upcomingEvents as DashboardData['upcomingEvents'],
    recentNotifications: recentNotifications as DashboardData['recentNotifications'],
    cmsSections: cmsSections as DashboardData['cmsSections'],
    catalogStatusBreakdown,
    galleryBreakdown: {
      images: galleryImages,
      videos: galleryVideos,
      lastUpload: galleryLastUpload,
    },
  }
}
