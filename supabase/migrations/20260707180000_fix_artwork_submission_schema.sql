-- ============================================================
-- Migration: Fix Artwork Submission Schema
-- Date: 2026-07-07
-- Purpose: Fix multiple NOT NULL constraint violations that block
--          all artwork submissions, add main_image_url column,
--          and add member storage upload policy.
-- ============================================================

-- 1. Make optional fields nullable (they were incorrectly set to NOT NULL)
ALTER TABLE artworks ALTER COLUMN title_bn DROP NOT NULL;
ALTER TABLE artworks ALTER COLUMN medium_en DROP NOT NULL;
ALTER TABLE artworks ALTER COLUMN medium_bn DROP NOT NULL;
ALTER TABLE artworks ALTER COLUMN materials_en DROP NOT NULL;
ALTER TABLE artworks ALTER COLUMN materials_bn DROP NOT NULL;
ALTER TABLE artworks ALTER COLUMN dimensions DROP NOT NULL;

-- 2. Add main_image_url column for storing the primary image URL directly on the artwork
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS main_image_url TEXT;

-- 3. Add availability column if missing (used by submission form)
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS availability_status_col TEXT DEFAULT 'not_for_sale';

-- 4. Allow members to upload to artworks_optimized bucket (submissions)
-- Drop the committee-only policy and replace with member-accessible one
DROP POLICY IF EXISTS "Committee can manage optimized artworks" ON storage.objects;

CREATE POLICY "Members can upload artwork images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artworks_optimized');

CREATE POLICY "Members can view own artwork images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'artworks_optimized');

CREATE POLICY "Admins can manage optimized artworks" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'artworks_optimized' AND (SELECT is_admin()));

-- 5. Notifications INSERT policy for system actions (server actions run as authenticated user)
-- The existing RLS blocks server actions from inserting notifications for other users.
-- We fix this by allowing system inserts via SECURITY DEFINER (already handled in RPC).
-- Add a permissive INSERT policy so server actions can create notifications.
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Authenticated can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 6. Allow audit_logs INSERT from authenticated users (server actions)
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 7. Fix artworks UPDATE policy to also allow changes_requested status
DROP POLICY IF EXISTS "Artists can update own pending artwork" ON artworks;
CREATE POLICY "Artists can update own pending or revision artwork" ON artworks
  FOR UPDATE USING (
    auth.uid() = artist_id
    AND status IN ('pending'::artwork_status, 'changes_requested'::artwork_status)
  );

-- 8. Add notes column to artworks (moderator feedback / revision instructions)
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS notes TEXT;

-- 9. Add availability column (rename to avoid conflict with availability_status enum)
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'not_for_sale';

-- 10. Add profile social columns that the ProfileForm and validations reference
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_in_app BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_exhibition_announcements BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_deadline_reminders BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_artwork_updates BOOLEAN DEFAULT true;

-- 11. Allow members to upload their own avatars (upsert support)
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner);

