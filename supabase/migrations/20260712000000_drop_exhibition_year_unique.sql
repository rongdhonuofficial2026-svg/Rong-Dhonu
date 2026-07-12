-- =========================================================
-- Migration: Drop UNIQUE constraint on exhibitions.year
-- Date: 2026-07-12
--
-- REASON: Business requirement allows multiple exhibitions
-- in the same calendar year (e.g. Spring, Summer, Autumn,
-- Winter exhibitions all in 2026). The previous "one per
-- year" constraint was architecturally incorrect.
--
-- SAFETY:
--   • No data is deleted or moved.
--   • The table is NOT recreated.
--   • The non-unique index idx_exhibitions_year is kept
--     for fast year-based queries.
--   • Duplicate detection is now handled in application
--     logic (same title + same start date = duplicate).
-- =========================================================

-- 1. Drop the unique constraint
--    PostgreSQL auto-names it <table>_<col>_key
ALTER TABLE exhibitions
  DROP CONSTRAINT IF EXISTS exhibitions_year_key;

-- 2. The column itself (INTEGER NOT NULL) stays — we still
--    store year for display / ordering purposes.
--    No column type change needed.

-- 3. The non-unique performance index stays untouched.
--    (idx_exhibitions_year was created in the base migration)

-- 4. Verify: no other unique indexes reference year
--    (this is a comment/note for reviewers, not executable)
