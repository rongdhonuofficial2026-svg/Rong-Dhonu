-- ================================================================
-- Migration: Comprehensive Workflow Repair
-- Date: 2026-07-07
-- Purpose: Fix all identified root causes blocking the complete
--          Artist → Submission → Moderation → Public workflow.
-- ================================================================

-- 1. Add 'year' column to artworks (the server action always writes it)
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS year INTEGER;

-- 2. Update moderate_artwork_transaction to also save moderator feedback (notes)
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
    RAISE EXCEPTION 'Artwork not found: %', p_artwork_id;
  END IF;

  -- 2. Update artwork status AND notes in a single atomic statement
  UPDATE artworks
  SET
    status = p_status,
    notes  = COALESCE(p_reason, notes),   -- preserve existing notes if no new reason given
    updated_at = NOW()
  WHERE id = p_artwork_id;

  -- 3. Insert audit log with reason
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (
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
  INSERT INTO notifications (user_id, type, message_en, message_bn)
  VALUES (
    v_artist_id,
    v_notification_type,
    'Your artwork "' || v_title || '" has been ' || p_status ||
      CASE WHEN p_reason IS NOT NULL THEN '. Feedback: ' || p_reason ELSE '' END,
    'আপনার শিল্পকর্ম "' || v_title || '" এর সিদ্ধান্ত নেওয়া হয়েছে: ' || p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add exhibition_participants INSERT policy (may be missing)
DROP POLICY IF EXISTS "Artists can register for exhibitions" ON exhibition_participants;
CREATE POLICY "Artists can register for exhibitions"
  ON exhibition_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = artist_id);

-- 4. Ensure admins can read all artworks regardless of status
DROP POLICY IF EXISTS "Admins can manage artworks" ON artworks;
CREATE POLICY "Admins can manage artworks"
  ON artworks FOR ALL
  TO authenticated
  USING (is_admin());

-- 5. Ensure artists can always read their own artworks (any status)
DROP POLICY IF EXISTS "Public can view approved artworks" ON artworks;
CREATE POLICY "Anyone can view approved or own artworks"
  ON artworks FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = artist_id
    OR is_admin()
  );

-- 6. Allow storage public read for artworks_optimized (so images appear publicly)
DROP POLICY IF EXISTS "Public can view artwork images" ON storage.objects;
CREATE POLICY "Public can view artwork images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'artworks_optimized');

-- 7. Allow storage public read for avatars bucket
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- 8. Ensure exhibition_participants can be read by admins
DROP POLICY IF EXISTS "Admins can manage exhibition_participants" ON exhibition_participants;
CREATE POLICY "Admins can manage exhibition_participants"
  ON exhibition_participants FOR ALL
  TO authenticated
  USING (is_admin());
