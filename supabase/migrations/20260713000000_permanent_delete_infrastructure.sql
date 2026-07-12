-- =============================================================
-- Migration: Permanent Delete Infrastructure
-- Creates the pending_storage_deletions operational queue table.
-- This is NOT an audit log. It is a retry queue for storage
-- cleanup operations that failed during exhibition deletion.
-- Audit history remains in audit_logs, which is immutable.
-- =============================================================

CREATE TABLE IF NOT EXISTS pending_storage_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- No FK to exhibitions(id) — the exhibition is already deleted by the time this row is written
  exhibition_id UUID,
  exhibition_name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL CHECK (storage_bucket IN ('artworks_raw', 'artworks_optimized', 'gallery', 'catalogs', 'certificates')),
  storage_path TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_retried_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pending_storage_status ON pending_storage_deletions(status);
CREATE INDEX IF NOT EXISTS idx_pending_storage_exhibition ON pending_storage_deletions(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_pending_storage_created ON pending_storage_deletions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pending_storage_deletions ENABLE ROW LEVEL SECURITY;

-- Only owners can read or manage storage cleanup tasks
CREATE POLICY "Owners can manage storage deletions" ON pending_storage_deletions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );
