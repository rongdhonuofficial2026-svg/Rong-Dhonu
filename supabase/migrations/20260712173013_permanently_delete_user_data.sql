-- RPC to permanently delete a user's relational data within a transaction
-- This ensures no orphans remain before the Auth user is deleted from the client.

CREATE OR REPLACE FUNCTION permanently_delete_user_data(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Anonymize audit logs instead of deleting to preserve system history without PII
  UPDATE audit_logs 
  SET 
    actor_id = NULL,
    details = jsonb_set(
      COALESCE(details, '{}'::jsonb),
      '{actor_deleted}',
      'true'::jsonb
    )
  WHERE actor_id = target_user_id;

  -- 2. Delete from gallery_media (no CASCADE defined on foreign key)
  DELETE FROM gallery_media WHERE uploaded_by = target_user_id;

  -- 3. Delete from catalogs (no CASCADE defined)
  DELETE FROM catalogs WHERE uploaded_by = target_user_id;

  -- 4. Delete from exhibition_participants
  DELETE FROM exhibition_participants WHERE artist_id = target_user_id;

  -- 5. Delete from committee_members
  DELETE FROM committee_members WHERE profile_id = target_user_id;

  -- 6. Delete from direct messages
  DELETE FROM messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
  DELETE FROM message_threads WHERE participant1_id = target_user_id OR participant2_id = target_user_id;

  -- 7. Delete from notifications
  DELETE FROM notifications WHERE user_id = target_user_id;

  -- 8. Delete artworks (some FKs might cascade, but this guarantees deletion)
  DELETE FROM artworks WHERE artist_id = target_user_id;

  -- 9. Delete profile
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Note: The auth user identity and storage files MUST be deleted 
  -- by the Node/Next server action AFTER this function succeeds.
END;
$$;
