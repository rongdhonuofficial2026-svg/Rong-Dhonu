import type { Database } from './database'

// ─── Row type aliases ─────────────────────────────────────────────────────────
export type ProfileRow       = Database['public']['Tables']['profiles']['Row']
export type ExhibitionRow    = Database['public']['Tables']['exhibitions']['Row']
export type ArtworkRow       = Database['public']['Tables']['artworks']['Row']
export type ArtworkImageRow  = Database['public']['Tables']['artwork_images']['Row']

export type EventRow         = Database['public']['Tables']['events']['Row']
export type AuditLogRow      = Database['public']['Tables']['audit_logs']['Row']
export type CatalogRow       = Database['public']['Tables']['catalogs']['Row']
export type GalleryMediaRow  = Database['public']['Tables']['gallery_media']['Row']
export type NotificationRow  = Database['public']['Tables']['notifications']['Row']
export type CmsContentRow    = Database['public']['Tables']['cms_content']['Row']

// ─── Joined / enriched types ──────────────────────────────────────────────────

export type AuditLogWithProfile = Pick<AuditLogRow, 'id' | 'actor_id' | 'action' | 'entity_type' | 'entity_id' | 'created_at'> & {
  profiles: Pick<ProfileRow, 'full_name_en' | 'avatar_url'> | null
}

export type ArtworkWithArtistAndImage = Pick<
  ArtworkRow,
  'id' | 'title_en' | 'medium_en' | 'category' | 'status' | 'created_at' | 'artist_id'
> & {
  profiles: Pick<ProfileRow, 'full_name_en'> | null
  artwork_images: Pick<ArtworkImageRow, 'url_thumbnail' | 'order_index'>[]
}

// ─── KPI aggregates ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalArtists: number
  newArtistsThisMonth: number
  totalArtworks: number
  pendingArtworks: number
  approvedArtworks: number
  rejectedArtworks: number
  totalExhibitions: number
  activeExhibitions: number

  publishedCatalogs: number
  draftCatalogs: number
  totalCatalogDownloads: number
  totalGalleryMedia: number
  totalImages: number
  totalVideos: number
  unreadNotifications: number
  pendingParticipants: number
  totalAdmins: number

  approvalRate: number
}

// ─── Top-level dashboard data contract ─────────────────────────────────────────

export interface DashboardData {
  currentUser: Pick<ProfileRow, 'id' | 'full_name_en' | 'role' | 'avatar_url' | 'email'>
  activeExhibition: ExhibitionRow | null
  kpis: DashboardKPIs
  recentAudits: AuditLogWithProfile[]
  pendingArtworkList: ArtworkWithArtistAndImage[]
  recentArtists: Pick<ProfileRow, 'id' | 'full_name_en' | 'bio_en' | 'avatar_url' | 'created_at' | 'slug'>[]
  recentArtworks: ArtworkWithArtistAndImage[]

  upcomingEvents: Pick<EventRow, 'id' | 'title_en' | 'date_time' | 'description_en' | 'speaker_en'>[]
  recentNotifications: Pick<NotificationRow, 'id' | 'type' | 'message_en' | 'read_status' | 'created_at'>[]
  cmsSections: Pick<CmsContentRow, 'page' | 'section' | 'updated_at'>[]
  catalogStatusBreakdown: { published: number; draft: number; archived: number }
  galleryBreakdown: { images: number; videos: number; lastUpload: string | null }
}

// ─── Safe unwrap helpers ────────────────────────────────────────────────────────

export function safeData<T>(
  result: PromiseSettledResult<{ data: T | null; error: unknown }>,
  fallback: T
): T {
  if (result.status === 'rejected') return fallback
  return result.value.data ?? fallback
}

export function safeCount(
  result: PromiseSettledResult<{ count: number | null; error: unknown; data: null }>,
  fallback = 0
): number {
  if (result.status === 'rejected') return fallback
  return result.value.count ?? fallback
}
