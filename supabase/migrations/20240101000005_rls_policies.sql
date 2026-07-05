-- Enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- global_settings & cms_content (Public Read, Admin Write)
CREATE POLICY "Public can view settings" ON global_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON global_settings USING (is_admin());

CREATE POLICY "Public can view cms content" ON cms_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage cms content" ON cms_content USING (is_admin());

-- profiles (Public Read, Owner Update, Admin All)
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON profiles USING (is_admin());
-- Insert is typically handled via trigger on auth.users creation, so we allow trigger to bypass RLS or allow insert on matching ID
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- exhibitions & events & committee & catalogs & gallery (Public Read, Admin Write)
CREATE POLICY "Public can view published exhibitions" ON exhibitions FOR SELECT USING (status != 'draft' OR is_admin());
CREATE POLICY "Admins can manage exhibitions" ON exhibitions USING (is_admin());

CREATE POLICY "Public can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON events USING (is_admin());

CREATE POLICY "Public can view committee" ON committee_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage committee" ON committee_members USING (is_admin());

CREATE POLICY "Public can view catalogs" ON catalogs FOR SELECT USING (true);
CREATE POLICY "Admins can manage catalogs" ON catalogs USING (is_admin());

CREATE POLICY "Public can view gallery" ON gallery_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON gallery_media USING (is_admin());

-- exhibition_participants (Owner view/insert, Admin All)
CREATE POLICY "Artists can view own participation" ON exhibition_participants FOR SELECT USING (auth.uid() = artist_id OR is_admin());
CREATE POLICY "Artists can register" ON exhibition_participants FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Admins can manage participants" ON exhibition_participants USING (is_admin());

-- artworks (Public view if approved, Owner manage if pending, Admin All)
CREATE POLICY "Public can view approved artworks" ON artworks FOR SELECT USING (status = 'approved' OR auth.uid() = artist_id OR is_admin());
CREATE POLICY "Artists can submit artwork" ON artworks FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update own pending artwork" ON artworks FOR UPDATE USING (auth.uid() = artist_id AND status = 'pending');
CREATE POLICY "Artists can delete own pending artwork" ON artworks FOR DELETE USING (auth.uid() = artist_id AND status = 'pending');
CREATE POLICY "Admins can manage artworks" ON artworks USING (is_admin());

-- artwork_images (Same logic as artworks)
CREATE POLICY "Public can view images for approved artworks" ON artwork_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM artworks WHERE id = artwork_images.artwork_id AND (status = 'approved' OR artist_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Artists can insert images for their artworks" ON artwork_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM artworks WHERE id = artwork_images.artwork_id AND artist_id = auth.uid())
);
CREATE POLICY "Artists can update images for their pending artworks" ON artwork_images FOR UPDATE USING (
    EXISTS (SELECT 1 FROM artworks WHERE id = artwork_images.artwork_id AND artist_id = auth.uid() AND status = 'pending')
);
CREATE POLICY "Artists can delete images for their pending artworks" ON artwork_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM artworks WHERE id = artwork_images.artwork_id AND artist_id = auth.uid() AND status = 'pending')
);
CREATE POLICY "Admins can manage artwork images" ON artwork_images USING (is_admin());

-- notifications (Owner View/Update read status, System/Admin Insert)
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON notifications USING (is_admin());

-- audit_logs (Admin Only)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin());
-- System inserts logs via functions, bypassing RLS
