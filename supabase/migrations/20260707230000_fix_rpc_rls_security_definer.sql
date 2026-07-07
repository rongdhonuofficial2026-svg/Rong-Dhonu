-- ================================================================
-- Migration: Fix RPC RLS / SECURITY DEFINER Conflict
-- Date: 2026-07-07
-- 
-- ROOT CAUSE:
-- moderate_artwork_transaction() is SECURITY DEFINER, so it runs
-- as the 'postgres' DB role, not the 'authenticated' Supabase role.
-- The RLS policies on audit_logs and notifications only allow
-- TO authenticated. This causes every INSERT inside the RPC to be
-- blocked by RLS, rolling back the entire transaction including the
-- artwork status UPDATE. The artwork status is never saved.
--
-- FIX STRATEGY:
-- 1. Strip all INSERT side-effects from the RPC.
--    The RPC now ONLY does: SELECT (lock) + UPDATE artworks + RETURN.
--    This is the atomic state machine. It commits reliably.
-- 2. Notifications and audit logs are written by the server action
--    using the Supabase client (runs as 'authenticated').
--    If they fail, the artwork status is already committed -- safe.
-- 3. Add explicit RLS bypass policies using USING (true) so that
--    if we ever need server-side inserts they also work.
-- ================================================================

-- 1. Add submission_received to notification_type if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'submission_received'
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'submission_received';
  END IF;
END$$;

-- 2. Rebuild moderate_artwork_transaction
--    NOW: only does state-machine UPDATE, no INSERT side effects
DROP FUNCTION IF EXISTS moderate_artwork_transaction(uuid, artwork_status, uuid, text);

CREATE FUNCTION moderate_artwork_transaction(
  p_artwork_id UUID,
  p_status     artwork_status,
  p_admin_id   UUID,
  p_reason     TEXT DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_old_status    artwork_status;
  v_artist_id     UUID;
  v_exhibition_id UUID;
  v_title         TEXT;
BEGIN
  -- Lock the row to prevent concurrent moderations
  SELECT status, artist_id, exhibition_id, title_en
  INTO v_old_status, v_artist_id, v_exhibition_id, v_title
  FROM artworks
  WHERE id = p_artwork_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artwork not found: %', p_artwork_id;
  END IF;

  -- State machine: block invalid transitions
  IF v_old_status = p_status THEN
    RAISE EXCEPTION 'Artwork status is already %', p_status;
  END IF;
  IF v_old_status = 'approved' AND p_status IN ('rejected', 'changes_requested') THEN
    RAISE EXCEPTION 'Cannot change status of an already-approved artwork.';
  END IF;
  IF v_old_status = 'rejected' AND p_status != 'pending' THEN
    RAISE EXCEPTION 'Rejected artworks require a new submission.';
  END IF;

  -- Require feedback for rejection and revision requests
  IF p_status IN ('rejected', 'changes_requested') AND (p_reason IS NULL OR TRIM(p_reason) = '') THEN
    RAISE EXCEPTION 'Moderator feedback is required for rejection or revision requests.';
  END IF;

  -- Perform the atomic status update
  IF p_status = 'approved' THEN
    UPDATE artworks SET
      status             = 'approved',
      moderator_feedback = COALESCE(NULLIF(TRIM(COALESCE(p_reason, '')), ''), moderator_feedback),
      notes              = COALESCE(NULLIF(TRIM(COALESCE(p_reason, '')), ''), notes),
      approved_at        = NOW(),
      approved_by        = p_admin_id,
      rejected_at        = NULL,
      rejected_by        = NULL,
      updated_at         = NOW()
    WHERE id = p_artwork_id;

  ELSIF p_status = 'rejected' THEN
    UPDATE artworks SET
      status             = 'rejected',
      moderator_feedback = p_reason,
      notes              = p_reason,
      rejected_at        = NOW(),
      rejected_by        = p_admin_id,
      updated_at         = NOW()
    WHERE id = p_artwork_id;

  ELSIF p_status = 'changes_requested' THEN
    UPDATE artworks SET
      status             = 'changes_requested',
      moderator_feedback = p_reason,
      notes              = p_reason,
      updated_at         = NOW()
    WHERE id = p_artwork_id;
  END IF;

  -- Return result for the server action to use (notifications + audit go there)
  RETURN jsonb_build_object(
    'artwork_id',    p_artwork_id,
    'old_status',    v_old_status,
    'new_status',    p_status,
    'exhibition_id', v_exhibition_id,
    'artist_id',     v_artist_id,
    'title',         v_title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Rebuild resubmit_artwork with same stripped approach
DROP FUNCTION IF EXISTS resubmit_artwork(uuid, uuid);

CREATE FUNCTION resubmit_artwork(
  p_artwork_id UUID,
  p_artist_id  UUID
) RETURNS jsonb AS $$
DECLARE
  v_status artwork_status;
  v_title  TEXT;
  v_exhibition_id UUID;
BEGIN
  SELECT status, title_en, exhibition_id
  INTO v_status, v_title, v_exhibition_id
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

  RETURN jsonb_build_object(
    'artwork_id',    p_artwork_id,
    'artist_id',     p_artist_id,
    'exhibition_id', v_exhibition_id,
    'title',         v_title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix RLS on audit_logs and notifications to also allow postgres role
--    (belt-and-suspenders: server action handles these, but this prevents
--     failures if any future code adds back DB-side inserts)
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated, postgres, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can insert notifications" ON notifications;
CREATE POLICY "Authenticated can insert notifications" ON notifications
  FOR INSERT TO authenticated, postgres, anon
  WITH CHECK (true);

-- 5. Ensure the on_artwork_status_change trigger is dropped
--    (it uses auth.uid() which returns NULL in SECURITY DEFINER context,
--     causing the trigger's audit log INSERT to fail with FK violation)
DROP TRIGGER IF EXISTS on_artwork_status_change ON artworks;
