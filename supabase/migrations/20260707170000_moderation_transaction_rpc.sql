-- Add changes_requested to artwork_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'artwork_status' AND e.enumlabel = 'changes_requested') THEN
    ALTER TYPE artwork_status ADD VALUE 'changes_requested';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'changes_requested') THEN
    ALTER TYPE notification_type ADD VALUE 'changes_requested';
  END IF;
END$$;

-- Drop the old trigger as we will use the RPC for better audit logging with reasons
DROP TRIGGER IF EXISTS on_artwork_status_change ON artworks;

-- Create the RPC for transactional moderation
CREATE OR REPLACE FUNCTION moderate_artwork_transaction(
  p_artwork_id UUID,
  p_status artwork_status,
  p_admin_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_old_status artwork_status;
  v_artist_id UUID;
  v_exhibition_id UUID;
  v_title TEXT;
  v_notification_type notification_type;
BEGIN
  -- 1. Retrieve artwork details
  SELECT status, artist_id, exhibition_id, title_en
  INTO v_old_status, v_artist_id, v_exhibition_id, v_title
  FROM artworks
  WHERE id = p_artwork_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;

  -- 2. Update artwork status
  UPDATE artworks SET status = p_status WHERE id = p_artwork_id;

  -- 3. Insert audit log with reason
  INSERT INTO audit_logs (
    actor_id, action, entity_type, entity_id, details
  ) VALUES (
    p_admin_id,
    'moderate_artwork',
    'artwork',
    p_artwork_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status,
      'reason', p_reason
    )
  );

  -- 4. Determine notification type
  IF p_status = 'approved' THEN
    v_notification_type := 'submission_approved';
  ELSIF p_status = 'rejected' THEN
    v_notification_type := 'submission_rejected';
  ELSIF p_status = 'changes_requested' THEN
    v_notification_type := 'changes_requested';
  ELSE
    v_notification_type := 'submission_received';
  END IF;

  -- 5. Insert notification for the artist
  INSERT INTO notifications (
    user_id, type, message_en, message_bn
  ) VALUES (
    v_artist_id,
    v_notification_type,
    'Your artwork "' || v_title || '" status has been updated to: ' || p_status || COALESCE('. Reason: ' || p_reason, ''),
    'আপনার শিল্পকর্ম "' || v_title || '" এর স্ট্যাটাস আপডেট করা হয়েছে: ' || p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
