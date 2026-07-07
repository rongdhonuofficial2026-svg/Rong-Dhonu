-- Migration: Add audit columns for soft delete / trash in exhibitions
-- Date: 2026-07-08

ALTER TABLE exhibitions 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index to optimize filtering active vs trashed items
CREATE INDEX IF NOT EXISTS idx_exhibitions_deleted_at ON exhibitions(deleted_at);
