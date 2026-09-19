-- Add mobile_image_position column to exhibitions
-- Stores the CSS object-position + zoom value used for the banner on mobile (≤760px)
-- e.g. 'center center', '72% 35%', '72% 35% / 1.3'
-- Default is 'center center' which matches the existing behaviour exactly.

ALTER TABLE exhibitions
  ADD COLUMN IF NOT EXISTS mobile_image_position TEXT DEFAULT 'center center';

-- Ensure it's TEXT to allow custom coordinates and zoom strings
ALTER TABLE exhibitions
  ALTER COLUMN mobile_image_position TYPE TEXT;
