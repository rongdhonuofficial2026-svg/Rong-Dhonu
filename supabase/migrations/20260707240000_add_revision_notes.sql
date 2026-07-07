-- ================================================================
-- Migration: Add Revision Notes to Artworks
-- Date: 2026-07-07
-- 
-- PURPOSE:
-- Adds a revision_notes column to the artworks table to store the
-- artist's explanation of changes made during resubmission.
-- ================================================================

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS revision_notes TEXT;
