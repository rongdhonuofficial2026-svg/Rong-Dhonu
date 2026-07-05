-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks_raw', 'artworks_raw', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks_optimized', 'artworks_optimized', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('catalogs', 'catalogs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- Storage RLS Policies

-- artworks_raw (Members can upload, Admins can view/manage)
CREATE POLICY "Members can upload raw artworks" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artworks_raw');
CREATE POLICY "Artists can view own raw artworks" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'artworks_raw' AND auth.uid() = owner);
CREATE POLICY "Admins can manage raw artworks" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'artworks_raw' AND (SELECT is_admin()));

-- artworks_optimized (Public view, System/Admin manage)
CREATE POLICY "Public can view optimized artworks" ON storage.objects FOR SELECT USING (bucket_id = 'artworks_optimized');
CREATE POLICY "Admins can manage optimized artworks" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'artworks_optimized' AND (SELECT is_admin()));

-- gallery (Public view, Admin manage)
CREATE POLICY "Public can view gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins can manage gallery" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'gallery' AND (SELECT is_admin()));

-- catalogs (Public view, Admin manage)
CREATE POLICY "Public can view catalogs" ON storage.objects FOR SELECT USING (bucket_id = 'catalogs');
CREATE POLICY "Admins can manage catalogs" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'catalogs' AND (SELECT is_admin()));

-- avatars (Public view, Owner upload)
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- certificates (Admins and Owner view/manage)
CREATE POLICY "Artists can upload certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates' AND auth.uid() = owner);
CREATE POLICY "Artists can view own certificates" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'certificates' AND auth.uid() = owner);
CREATE POLICY "Admins can view and manage certificates" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'certificates' AND (SELECT is_admin()));
