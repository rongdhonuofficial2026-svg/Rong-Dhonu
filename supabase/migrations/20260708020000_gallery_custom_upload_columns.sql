-- Migration: Add nullable custom upload fields and update RLS policies for visibility control

ALTER TABLE gallery_media
ADD COLUMN videographer TEXT,
ADD COLUMN copyright TEXT,
ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'hidden'));

-- Drop and recreate select policy to respect visibility
DROP POLICY IF EXISTS "Public can view gallery" ON gallery_media;
CREATE POLICY "Public can view gallery" ON gallery_media FOR SELECT USING (
  visibility = 'public' OR is_admin()
);
