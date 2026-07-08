-- 20260708060000_cms_engine_v2.sql
-- Create relational CMS tables, indexes, and RLS policies

-- 1. Drop existing cms_content table
DROP TABLE IF EXISTS cms_content CASCADE;

-- 2. Create cms_pages table
CREATE TABLE cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create cms_sections table
CREATE TABLE cms_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE NOT NULL,
    section_key TEXT NOT NULL,
    component_type TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, section_key)
);

-- 4. Create new cms_content table
CREATE TABLE cms_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES cms_sections(id) ON DELETE CASCADE NOT NULL,
    field_key TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'textarea', 'rich_text', 'media', 'button', 'select', 'boolean', 'number', 'json')),
    value_en TEXT,
    value_bn TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, field_key)
);

-- 5. Create cms_media table
CREATE TABLE cms_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES cms_content(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    alt_text_en TEXT,
    alt_text_bn TEXT,
    focal_point JSONB DEFAULT '{"x":0.5,"y":0.5}'::jsonb,
    crop_settings JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create cms_versions table
CREATE TABLE cms_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE NOT NULL,
    version INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    change_summary TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create cms_schedules table
CREATE TABLE cms_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE NOT NULL,
    publish_at TIMESTAMPTZ NOT NULL,
    expire_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
    snapshot JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Indexes for performance optimization
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_sections_page ON cms_sections(page_id);
CREATE INDEX idx_cms_sections_order ON cms_sections(display_order);
CREATE INDEX idx_cms_content_section ON cms_content(section_id);
CREATE INDEX idx_cms_media_content ON cms_media(content_id);
CREATE INDEX idx_cms_versions_page ON cms_versions(page_id);
CREATE INDEX idx_cms_schedules_page ON cms_schedules(page_id);
CREATE INDEX idx_cms_schedules_status_time ON cms_schedules(status, publish_at);

-- 9. Enable Row Level Security (RLS) on all tables
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_schedules ENABLE ROW LEVEL SECURITY;

-- 10. Helper function to check if the current user is an admin/owner/committee
CREATE OR REPLACE FUNCTION public.is_cms_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner', 'committee')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create RLS Policies

-- Public Read access for published pages/content
CREATE POLICY "Public Read Pages" ON cms_pages
    FOR SELECT USING (status = 'published' OR public.is_cms_manager());

CREATE POLICY "Public Read Sections" ON cms_sections
    FOR SELECT USING (enabled = TRUE OR public.is_cms_manager());

CREATE POLICY "Public Read Content" ON cms_content
    FOR SELECT USING (TRUE);

CREATE POLICY "Public Read Media" ON cms_media
    FOR SELECT USING (TRUE);

-- Manager All Access for CMS Tables
CREATE POLICY "Manager All Access Pages" ON cms_pages
    FOR ALL USING (public.is_cms_manager());

CREATE POLICY "Manager All Access Sections" ON cms_sections
    FOR ALL USING (public.is_cms_manager());

CREATE POLICY "Manager All Access Content" ON cms_content
    FOR ALL USING (public.is_cms_manager());

CREATE POLICY "Manager All Access Media" ON cms_media
    FOR ALL USING (public.is_cms_manager());

CREATE POLICY "Manager All Access Versions" ON cms_versions
    FOR ALL USING (public.is_cms_manager());

CREATE POLICY "Manager All Access Schedules" ON cms_schedules
    FOR ALL USING (public.is_cms_manager());

-- 12. Seed Default CMS Content

-- Seed Pages
INSERT INTO cms_pages (slug, title, status) VALUES
('home', 'Homepage Content', 'published'),
('about', 'About Page Content', 'published'),
('exhibitions', 'Exhibitions Directory Content', 'published'),
('gallery', 'Public Gallery Banners', 'published'),
('catalogs', 'Catalogs Downloads Content', 'published'),
('contact', 'Contact and Venue Info', 'published'),
('global', 'Global Platform Settings', 'published');

-- Seed Sections & Contents for Homepage
DO $$
DECLARE
    home_page_id UUID;
    section_id UUID;
    content_id UUID;
BEGIN
    SELECT id INTO home_page_id FROM cms_pages WHERE slug = 'home';
    
    -- Home Section: Hero
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (home_page_id, 'hero', 'Hero', 0) RETURNING id INTO section_id;
    
    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'badge', 'text', 'Where Art Meets Soul', 'যেখানে শিল্পের সাথে আত্মার মিলন ঘটে'),
    (section_id, 'title', 'text', 'Where Creativity Meets Legacy', 'যেখানে সৃজনশীলতা ঐতিহ্যকে স্পর্শ করে'),
    (section_id, 'subtitle', 'text', 'Experience the vibrant annual exhibition of the Rongdhono artists'' collective.', 'রংধনু শিল্পী সংঘের বার্ষিক আন্তর্জাতিক প্রদর্শনী'),
    (section_id, 'imageUrl', 'media', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000'),
    (section_id, 'ctaPrimary_en', 'text', 'View Gallery', 'গ্যালারি দেখুন'),
    (section_id, 'ctaPrimary_bn', 'text', 'গ্যালারি দেখুন', 'গ্যালারি দেখুন'),
    (section_id, 'ctaSecondary_en', 'text', 'Learn More', 'আরও জানুন'),
    (section_id, 'ctaSecondary_bn', 'text', 'আরও জানুন', 'আরও জানুন');

    -- Home Section: About
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (home_page_id, 'about', 'About', 1) RETURNING id INTO section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'title', 'text', 'About Rongdhono', 'রংধনু সম্পর্কে'),
    (section_id, 'mission', 'textarea', 'To foster a thriving community of artists and provide a platform for creative expression.', 'শিল্পীদের একটি সমৃদ্ধ সম্প্রদায় গড়ে তোলা এবং সৃজনশীল প্রকাশের জন্য একটি প্ল্যাটফর্ম প্রদান করা।'),
    (section_id, 'vision', 'textarea', 'To become the premier destination for contemporary art in West Bengal.', 'পশ্চিমবঙ্গের সমসাময়িক শিল্পের প্রধান গন্তব্য হয়ে ওঠা।'),
    (section_id, 'history', 'textarea', 'Founded with a passion for arts, Rongdhono has grown into a prestigious collective.', 'শিল্পকলার প্রতি অনুরাগের সাথে প্রতিষ্ঠিত, রংধনু একটি মর্যাদাপূর্ণ কালেক্টিভ হিসেবে বেড়ে উঠেছে।');

    -- Home Section: Sponsors
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (home_page_id, 'sponsors', 'Sponsors', 2) RETURNING id INTO section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'title', 'text', 'Supported By', 'পৃষ্ঠপোষকতায়'),
    (section_id, 'logos', 'json', '[{"name": "Cultural Ministry", "url": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop"}]', '[{"name": "Cultural Ministry", "url": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop"}]');

    -- Home Section: Testimonials
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (home_page_id, 'testimonials', 'Testimonials', 3) RETURNING id INTO section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'title', 'text', 'What They Say', 'তারা যা বলে'),
    (section_id, 'items', 'json', '[{"quote_en": "Beacon of light for the community", "author": "Anindita Ray", "role_en": "Art Critic"}]', '[{"quote_bn": "শৈল্পিক সম্প্রদায়ের জন্য আলো", "author": "Anindita Ray", "role_bn": "শিল্প সমালোচক"}]');

    -- Home Section: ContactCTA
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (home_page_id, 'contactCTA', 'CTA', 4) RETURNING id INTO section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'title', 'text', 'Join Our Artistic Journey', 'আমাদের শৈল্পিক যাত্রায় যোগ দিন'),
    (section_id, 'description', 'textarea', 'Subscribe to our newsletter to receive updates on upcoming exhibitions.', 'আসন্ন প্রদর্শনী এবং স্পটলাইট সম্পর্কে আপডেট পেতে আমাদের নিউজলেটার সাবস্ক্রাইব করুন।');
END $$;

-- Seed Sections & Contents for Contact Page
DO $$
DECLARE
    contact_page_id UUID;
    section_id UUID;
BEGIN
    SELECT id INTO contact_page_id FROM cms_pages WHERE slug = 'contact';

    -- Contact Section: Hero
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (contact_page_id, 'hero', 'Hero', 0) RETURNING id INTO section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'title', 'text', 'Get in Touch', 'যোগাযোগ করুন'),
    (section_id, 'subtitle', 'text', 'We would love to hear from you. Visit us at the Silva Tirtha Art Gallery.', 'আমরা আপনার কাছ থেকে শুনতে চাই। সিলভা তীর্থ আর্ট গ্যালারিতে আমাদের সাথে দেখা করুন।');

    -- Contact Section: Info
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (contact_page_id, 'info', 'InfoGrid', 1) RETURNING id INTO section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (section_id, 'venue', 'text', 'Silva Tirtha Art Gallery', 'সিলভা তীর্থ আর্ট গ্যালারি'),
    (section_id, 'address', 'textarea', 'Opposite Rabindra Bhavan (Southern Auditorium), Berhampore, West Bengal, India', 'রবীন্দ্র ভবন (সাউদার্ন অডিটোরিয়াম) এর বিপরীতে, বহরমপুর, পশ্চিমবঙ্গ, ভারত'),
    (section_id, 'email', 'text', 'contact@rongdhono.art', 'contact@rongdhono.art'),
    (section_id, 'phone', 'text', '+91 98765 43210', '+91 98765 43210');
END $$;
