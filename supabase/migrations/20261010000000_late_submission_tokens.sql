-- ============================================================
-- Migration: Late Submission Tokens
-- Date: 2026-10-10
-- Purpose: Add a secure table for admin-generated late submission
--          links. A raw token is shared with the participant;
--          only its SHA-256 hash is stored here so that a
--          database breach does not yield usable tokens.
-- ============================================================

CREATE TABLE late_submission_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Bound to exactly one exhibition; cannot be used for another
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,

  -- SHA-256 hex digest of the raw bearer token (never store raw)
  token_hash   TEXT NOT NULL UNIQUE,

  -- Human-readable note for the admin (e.g. "Priya Sharma — missed deadline")
  label        TEXT,

  -- Who created this token
  created_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- NULL = no expiry; set to future timestamp if admin wants auto-expiry
  expires_at   TIMESTAMPTZ,

  -- NULL = active; populated with NOW() when admin revokes
  revoked_at   TIMESTAMPTZ,

  -- How many times this token has been used to reach the form
  -- (incremented on first valid page load so admin can see activity)
  used_count   INTEGER NOT NULL DEFAULT 0,

  -- NULL = unlimited; set e.g. to 1 for single-use links
  max_uses     INTEGER
);

-- Index for fast per-exhibition listing in the admin dashboard
CREATE INDEX idx_late_tokens_exhibition ON late_submission_tokens(exhibition_id);

-- ── Row-Level Security ─────────────────────────────────────────────────────
-- Tokens are NEVER readable by anonymous users or regular members.
-- Validation is performed server-side (SECURITY DEFINER context) so RLS
-- does not need to grant token reads to anyone but admins.

ALTER TABLE late_submission_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage late submission tokens"
  ON late_submission_tokens
  USING (is_admin());

-- Allow server actions (authenticated context) to increment used_count
-- without admin role when they have already validated the token.
-- We use a SECURITY DEFINER function for this (see below).

-- ── Helper function: validate and record usage ─────────────────────────────
-- Called from server actions that process a late submission.
-- Returns the token row if valid, NULL otherwise.
-- SECURITY DEFINER bypasses RLS so non-admin authenticated users can
-- trigger the increment during submission without being granted SELECT/UPDATE
-- on the whole table.
CREATE OR REPLACE FUNCTION validate_and_use_late_token(
  p_token_hash TEXT,
  p_exhibition_id UUID
)
RETURNS late_submission_tokens
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token late_submission_tokens;
BEGIN
  -- Fetch and lock the token row
  SELECT * INTO v_token
  FROM late_submission_tokens
  WHERE token_hash = p_token_hash
    AND exhibition_id = p_exhibition_id
  FOR UPDATE;

  -- Not found
  IF v_token IS NULL THEN
    RETURN NULL;
  END IF;

  -- Revoked
  IF v_token.revoked_at IS NOT NULL THEN
    RETURN NULL;
  END IF;

  -- Expired
  IF v_token.expires_at IS NOT NULL AND v_token.expires_at < NOW() THEN
    RETURN NULL;
  END IF;

  -- Usage limit reached
  IF v_token.max_uses IS NOT NULL AND v_token.used_count >= v_token.max_uses THEN
    RETURN NULL;
  END IF;

  -- Increment usage counter
  UPDATE late_submission_tokens
  SET used_count = used_count + 1
  WHERE id = v_token.id;

  v_token.used_count := v_token.used_count + 1;
  RETURN v_token;
END;
$$;

-- Grant execute to authenticated role so server actions can call it
GRANT EXECUTE ON FUNCTION validate_and_use_late_token(TEXT, UUID) TO authenticated;
