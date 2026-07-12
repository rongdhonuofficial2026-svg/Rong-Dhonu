import { createClient } from '@/lib/supabase/server'

type ActionType = 
  | 'create_catalog'
  | 'update_catalog'
  | 'publish_catalog'
  | 'archive_catalog'
  | 'delete_catalog'
  | 'approve_artwork'
  | 'reject_artwork'
  | 'submit_artwork'
  | 'moderate_artwork'
  | 'update_exhibition'
  | 'update_user_role'
  | 'upload_media'
  | 'update_media'
  | 'delete_media'
  | 'bulk_update_media'
  | 'bulk_delete_media'
  | 'create_album'
  | 'update_album'
  | 'delete_album'
  | 'bulk_move_media'
  | 'bulk_change_category'
  | 'bulk_feature_media'
  | 'update_profile_by_admin'
  | 'change_user_role'
  | 'suspend_user'
  | 'reactivate_user'
  | 'approve_user'
  | 'delete_user_by_admin'
  | 'send_notification_by_admin'
  | 'delete_artwork_by_admin'
  | 'submit_inquiry'
  | 'subscribe_newsletter'
  | 'permanently_deleted_user'
  | 'permanently_deleted_user_incomplete'

export async function logAudit(
  action: ActionType,
  entityType: 'catalog' | 'artwork' | 'exhibition' | 'user' | 'gallery_media' | 'gallery_album' | 'profiles' | 'notifications' | 'newsletter_subscribers' | 'auth.users',
  entityId: string,
  details?: Record<string, any>
) {
  try {
    const supabase = await createClient()
    
    // Get the current user performing the action
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn('Audit Log: Could not determine actor. Logging without actor_id.')
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id: user?.id || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {}
      })

    if (error) {
      console.error('Audit Log Error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Audit Log Exception:', err)
    return false
  }
}
