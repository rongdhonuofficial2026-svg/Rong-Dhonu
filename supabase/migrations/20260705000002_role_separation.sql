-- Migration: Role Separation & RLS Updates
-- Date: 2026-07-05
-- Objective: Separate admin and committee roles and update RLS policies accordingly.

-- 1. Create is_committee() helper function
CREATE OR REPLACE FUNCTION is_committee() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'committee')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (is_admin() already exists and checks for role = 'admin')

-- 2. Update Artworks Policies (Moderation -> Committee or Admin)
DROP POLICY IF EXISTS "Public can view approved artworks" ON artworks;
DROP POLICY IF EXISTS "Admins can manage artworks" ON artworks;

CREATE POLICY "Public can view approved artworks" ON artworks 
FOR SELECT USING (status = 'approved' OR auth.uid() = artist_id OR is_committee());

CREATE POLICY "Committee can manage artworks" ON artworks 
FOR ALL USING (is_committee());

-- Update Artwork Images
DROP POLICY IF EXISTS "Public can view images for approved artworks" ON artwork_images;
DROP POLICY IF EXISTS "Admins can manage artwork images" ON artwork_images;

CREATE POLICY "Public can view images for approved artworks" ON artwork_images 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM artworks WHERE id = artwork_images.artwork_id AND (status = 'approved' OR artist_id = auth.uid() OR is_committee()))
);

CREATE POLICY "Committee can manage artwork images" ON artwork_images 
FOR ALL USING (is_committee());

-- 3. Update Catalogs Policies (Catalog Management -> Committee or Admin)
DROP POLICY IF EXISTS "Public can view catalogs" ON catalogs;
DROP POLICY IF EXISTS "Public can view published catalogs" ON catalogs;
DROP POLICY IF EXISTS "Admins can manage catalogs" ON catalogs;

CREATE POLICY "Public can view published catalogs" ON catalogs 
FOR SELECT USING (status = 'published' OR is_committee());

CREATE POLICY "Committee can manage catalogs" ON catalogs 
FOR ALL USING (is_committee());

-- 4. Update Gallery Policies (Gallery Management -> Committee or Admin)
DROP POLICY IF EXISTS "Public can view gallery" ON gallery_media;
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery_media;

CREATE POLICY "Public can view gallery" ON gallery_media 
FOR SELECT USING (true);

CREATE POLICY "Committee can manage gallery" ON gallery_media 
FOR ALL USING (is_committee());

-- 5. Update Exhibitions Policies (Management -> Committee or Admin)
DROP POLICY IF EXISTS "Public can view published exhibitions" ON exhibitions;
DROP POLICY IF EXISTS "Admins can manage exhibitions" ON exhibitions;

CREATE POLICY "Public can view published exhibitions" ON exhibitions 
FOR SELECT USING (status != 'draft' OR is_committee());

CREATE POLICY "Committee can manage exhibitions" ON exhibitions 
FOR ALL USING (is_committee());

-- 6. Update Storage Bucket Policies for Committee Access

-- artworks_raw
DROP POLICY IF EXISTS "Admins can manage raw artworks" ON storage.objects;
CREATE POLICY "Committee can manage raw artworks" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'artworks_raw' AND (SELECT is_committee()));

-- artworks_optimized
DROP POLICY IF EXISTS "Admins can manage optimized artworks" ON storage.objects;
CREATE POLICY "Committee can manage optimized artworks" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'artworks_optimized' AND (SELECT is_committee()));

-- gallery
DROP POLICY IF EXISTS "Admins can manage gallery" ON storage.objects;
CREATE POLICY "Committee can manage gallery" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'gallery' AND (SELECT is_committee()));

-- catalogs
DROP POLICY IF EXISTS "Admins can manage catalogs" ON storage.objects;
CREATE POLICY "Committee can manage catalogs" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'catalogs' AND (SELECT is_committee()));

-- certificates
DROP POLICY IF EXISTS "Admins can view and manage certificates" ON storage.objects;
CREATE POLICY "Committee can view and manage certificates" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'certificates' AND (SELECT is_committee()));

-- Note: User Management (profiles), Settings (global_settings), CMS (cms_content), and Analytics (audit_logs)
-- remain restricted to is_admin() as previously defined.
