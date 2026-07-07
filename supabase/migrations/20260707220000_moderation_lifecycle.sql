-- ================================================================
-- Migration: Complete Moderation Lifecycle
-- Date: 2026-07-07
-- NOTE: Bengali strings removed from SQL to avoid encoding issues
-- during migration. Notifications use English only here; 
-- the application layer handles bilingual display.
-- ================================================================

-- 1. Add moderation lifecycle columns to artworks
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS moderator_feedback TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS resubmission_count INTEGER DEFAULT 0;

-- 2. Backfill: copy existing notes into moderator_feedback
UPDATE artworks SET moderator_feedback = notes WHERE moderator_feedback IS NULL AND notes IS NOT NULL;

-- 3. Rebuild moderate_artwork_transaction with full validation + state machine
--    Must DROP first because return type is changing: void -> jsonb
DROP FUNCTION IF EXISTS moderate_artwork_transaction(uuid, artwork_status, uuid, text);
CREATE OR REPLACE FUNCTION moderate_artwork_transaction(
  p_artwork_id      UUID,
  p_status          artwork_status,
  p_admin_id        UUID,
  p_reason          TEXT DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_old_status      artwork_status;
  v_artist_id       UUID;
  v_exhibition_id   UUID;
  v_title           TEXT;
  v_notification_type notification_type;
BEGIN
  -- 1. Retrieve artwork with row-level lock
  SELECT status, artist_id, exhibition_id, title_en
  INTO v_old_status, v_artist_id, v_exhibition_id, v_title
  FROM artworks
  WHERE id = p_artwork_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artwork not found: %', p_artwork_id;
  END IF;

  -- 2. State machine guards
  IF v_old_status = 'approved' AND p_status = 'approved' THEN
    RAISE EXCEPTION 'Artwork is already approved.';
  END IF;
  IF v_old_status = 'approved' AND p_status = 'rejected' THEN
    RAISE EXCEPTION 'Cannot reject an already-approved artwork.';
  END IF;
  IF v_old_status = 'approved' AND p_status = 'changes_requested' THEN
    RAISE EXCEPTION 'Cannot request revision on an approved artwork.';
  END IF;
  IF v_old_status = 'rejected' AND p_status != 'pending' THEN
    RAISE EXCEPTION 'Rejected artworks cannot be re-moderated. A new submission is required.';
  END IF;

  -- 3. Feedback required for reject and revision
  IF p_status IN ('rejected', 'changes_requested') AND (p_reason IS NULL OR TRIM(p_reason) = '') THEN
    RAISE EXCEPTION 'Moderator feedback is required for rejection or revision requests.';
  END IF;

  -- 4. Apply the update based on action
  IF p_status = 'approved' THEN
    UPDATE artworks SET
      status             = 'approved',
      moderator_feedback = COALESCE(NULLIF(TRIM(COALESCE(p_reason,'')),  ''), moderator_feedback),
      notes              = COALESCE(NULLIF(TRIM(COALESCE(p_reason,'')), ''), notes),
      approved_at        = NOW(),
      approved_by        = p_admin_id,
      rejected_at        = NULL,
      rejected_by        = NULL,
      updated_at         = NOW()
    WHERE id = p_artwork_id;
    v_notification_type := 'submission_approved';

  ELSIF p_status = 'rejected' THEN
    UPDATE artworks SET
      status             = 'rejected',
      moderator_feedback = p_reason,
      notes              = p_reason,
      rejected_at        = NOW(),
      rejected_by        = p_admin_id,
      updated_at         = NOW()
    WHERE id = p_artwork_id;
    v_notification_type := 'submission_rejected';

  ELSIF p_status = 'changes_requested' THEN
    UPDATE artworks SET
      status             = 'changes_requested',
      moderator_feedback = p_reason,
      notes              = p_reason,
      updated_at         = NOW()
    WHERE id = p_artwork_id;
    v_notification_type := 'changes_requested';
  END IF;

  -- 5. Audit log
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (
    p_admin_id,
    'moderate_artwork',
    'artwork',
    p_artwork_id,
    jsonb_build_object(
      'old_status',    v_old_status,
      'new_status',    p_status,
      'exhibition_id', v_exhibition_id,
      'reason',        p_reason
    )
  );

  -- 6. Notify artist (English only in SQL layer)
  INSERT INTO notifications (user_id, type, message_en, message_bn)
  VALUES (
    v_artist_id,
    v_notification_type,
    CASE p_status
      WHEN 'approved'          THEN 'Congratulations! Your artwork "' || v_title || '" has been approved for the exhibition.'
      WHEN 'rejected'          THEN 'Your artwork "' || v_title || '" was not selected. Reason: ' || COALESCE(p_reason, 'No reason provided.')
      WHEN 'changes_requested' THEN 'Your artwork "' || v_title || '" requires revisions. Feedback: ' || p_reason
      ELSE 'Your artwork "' || v_title || '" status has been updated.'
    END,
    CASE p_status
      WHEN 'approved'          THEN 'Your artwork has been approved.'
      WHEN 'rejected'          THEN 'Your artwork was not selected.'
      WHEN 'changes_requested' THEN 'Your artwork requires revisions.'
      ELSE 'Your artwork status has been updated.'
    END
  );

  RETURN jsonb_build_object(
    'artwork_id',    p_artwork_id,
    'old_status',    v_old_status,
    'new_status',    p_status,
    'exhibition_id', v_exhibition_id,
    'artist_id',     v_artist_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Resubmission function: changes_requested -> pending
CREATE OR REPLACE FUNCTION resubmit_artwork(
  p_artwork_id UUID,
  p_artist_id  UUID
) RETURNS void AS $$
DECLARE
  v_status artwork_status;
  v_title  TEXT;
BEGIN
  SELECT status, title_en INTO v_status, v_title
  FROM artworks
  WHERE id = p_artwork_id AND artist_id = p_artist_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artwork not found or access denied.';
  END IF;

  IF v_status != 'changes_requested' THEN
    RAISE EXCEPTION 'Only artworks awaiting revision can be resubmitted. Current status: %', v_status;
  END IF;

  UPDATE artworks SET
    status             = 'pending',
    resubmission_count = COALESCE(resubmission_count, 0) + 1,
    moderator_feedback = NULL,
    notes              = NULL,
    updated_at         = NOW()
  WHERE id = p_artwork_id;

  INSERT INTO notifications (user_id, type, message_en, message_bn)
  VALUES (
    p_artist_id,
    'submission_received',
    'Your revised artwork "' || v_title || '" has been resubmitted and is awaiting moderator review.',
    'Your revised artwork has been resubmitted.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Artists can update their own editable artworks
DROP POLICY IF EXISTS "Artists can update own pending or revision artwork" ON artworks;
CREATE POLICY "Artists can update own artworks in editable states"
  ON artworks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = artist_id
    AND status IN ('pending'::artwork_status, 'changes_requested'::artwork_status)
  );

-- 6. Performance indexes for moderation queries
CREATE INDEX IF NOT EXISTS idx_artworks_exhibition_status ON artworks(exhibition_id, status);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_status ON artworks(artist_id, status);
