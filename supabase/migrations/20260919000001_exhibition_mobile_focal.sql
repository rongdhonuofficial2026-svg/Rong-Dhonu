-- Add mobile_image_position column to exhibitions
-- This stores the CSS object-position value used for the banner on mobile (≤760px)
-- e.g. 'center center', 'right top', 'left bottom'
-- Default is 'center center' which matches the existing behaviour exactly.
-- Safe, additive migration — no existing data is affected.

ALTER TABLE exhibitions
  ADD COLUMN IF NOT EXISTS mobile_image_position VARCHAR(20) DEFAULT 'center center';
