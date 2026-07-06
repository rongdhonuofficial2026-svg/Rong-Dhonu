-- Create dynamic categories table
CREATE TABLE gallery_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial categories to match existing enum/text values
INSERT INTO gallery_categories (slug, name_en, name_bn, sort_order) VALUES
('artwork', 'Artwork', 'শিল্পকর্ম', 1),
('opening_ceremony', 'Opening Ceremony', 'উদ্বোধনী অনুষ্ঠান', 2),
('award_ceremony', 'Award Ceremony', 'পুরস্কার বিতরণী', 3),
('artists', 'Artists', 'শিল্পীগণ', 4),
('visitors', 'Visitors', 'দর্শনার্থী', 5),
('vip', 'VIP Guests', 'ভিআইপি অতিথি', 6),
('behind_the_scenes', 'Behind The Scenes', 'পর্দার আড়ালে', 7),
('committee', 'Committee', 'কমিটি', 8),
('workshop', 'Workshop', 'কর্মশালা', 9),
('media_coverage', 'Media Coverage', 'মিডিয়া কভারেজ', 10)
ON CONFLICT (slug) DO NOTHING;

-- Create dynamic collections table
CREATE TABLE gallery_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    cover_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend gallery_media
-- Note: PostgreSQL automatically names the check constraint if not named. We will drop it and recreate it.
ALTER TABLE gallery_media DROP CONSTRAINT IF EXISTS gallery_media_status_check;
ALTER TABLE gallery_media ADD CONSTRAINT gallery_media_status_check CHECK (status IN ('draft', 'published', 'archived', 'deleted'));

ALTER TABLE gallery_media
ADD COLUMN collection_id UUID REFERENCES gallery_collections(id) ON DELETE SET NULL,
ADD COLUMN deleted_at TIMESTAMPTZ;

-- We don't make category a strict foreign key to avoid breaking if there's invalid data, but we can do it if safe:
-- We will just rely on the frontend pulling from gallery_categories.

-- Add indexes
CREATE INDEX idx_gallery_categories_slug ON gallery_categories(slug);
CREATE INDEX idx_gallery_collections_slug ON gallery_collections(slug);
CREATE INDEX idx_gallery_media_collection ON gallery_media(collection_id);
CREATE INDEX idx_gallery_media_deleted ON gallery_media(deleted_at);

-- RLS for new tables
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery categories" ON gallery_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery categories" ON gallery_categories USING (is_admin());

CREATE POLICY "Public can view gallery collections" ON gallery_collections FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery collections" ON gallery_collections USING (is_admin());
