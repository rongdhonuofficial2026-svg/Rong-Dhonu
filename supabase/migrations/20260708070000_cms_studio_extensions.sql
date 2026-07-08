-- 20260708070000_cms_studio_extensions.sql
-- Create database schema extensions for Rongdhono Content Studio 2.0

-- 1. Create cms_components table
CREATE TABLE IF NOT EXISTS cms_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    fields JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create cms_media_assets table
CREATE TABLE IF NOT EXISTS cms_media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    storage_path TEXT UNIQUE NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    folder_path TEXT NOT NULL DEFAULT '/',
    alt_text_en TEXT,
    alt_text_bn TEXT,
    caption_en TEXT,
    caption_bn TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create cms_dependencies table
CREATE TABLE IF NOT EXISTS cms_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES cms_media_assets(id) ON DELETE CASCADE,
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    section_id UUID REFERENCES cms_sections(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    UNIQUE(asset_id, page_id, section_id, field_key)
);

-- 4. Create cms_recycle_bin table
CREATE TABLE IF NOT EXISTS cms_recycle_bin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    original_id UUID NOT NULL,
    deleted_data JSONB NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_cms_media_assets_folder ON cms_media_assets(folder_path);
CREATE INDEX IF NOT EXISTS idx_cms_dependencies_asset ON cms_dependencies(asset_id);
CREATE INDEX IF NOT EXISTS idx_cms_recycle_bin_entity ON cms_recycle_bin(entity_type);

-- 6. Enable RLS
ALTER TABLE cms_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_recycle_bin ENABLE ROW LEVEL SECURITY;

-- 7. Policies
CREATE POLICY "Public Read Components" ON cms_components FOR SELECT USING (TRUE);
CREATE POLICY "Public Read Media Assets" ON cms_media_assets FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "Public Read Dependencies" ON cms_dependencies FOR SELECT USING (TRUE);

CREATE POLICY "Manager All Access Components" ON cms_components FOR ALL USING (public.is_cms_manager());
CREATE POLICY "Manager All Access Media Assets" ON cms_media_assets FOR ALL USING (public.is_cms_manager());
CREATE POLICY "Manager All Access Dependencies" ON cms_dependencies FOR ALL USING (public.is_cms_manager());
CREATE POLICY "Manager All Access Recycle Bin" ON cms_recycle_bin FOR ALL USING (public.is_cms_manager());

-- 8. Seed global setting rows
DO $$
DECLARE
    v_global_page_id UUID;
    v_section_id UUID;
BEGIN
    SELECT id INTO v_global_page_id FROM cms_pages WHERE slug = 'global';
    
    -- Global Section: Settings
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (v_global_page_id, 'settings', 'GlobalSettings', 0)
    ON CONFLICT (page_id, section_key) DO UPDATE SET component_type = 'GlobalSettings'
    RETURNING id INTO v_section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (v_section_id, 'site_name', 'text', 'Rongdhono', 'রংধনু'),
    (v_section_id, 'site_description', 'textarea', 'Digital museum and gallery of Rongdhono Artists'' Collective.', 'রংধনু শিল্পী সংঘের অফিসিয়াল ডিজিটাল মিউজিয়াম।'),
    (v_section_id, 'logo_url', 'media', '/images/logo.png', '/images/logo.png'),
    (v_section_id, 'favicon_url', 'media', '/favicon.ico', '/favicon.ico'),
    (v_section_id, 'copyright_text', 'text', 'Rongdhono Artists'' Collective. All rights reserved.', 'রংধনু শিল্পী সংঘ। সর্বস্বত্ব সংরক্ষিত।'),
    (v_section_id, 'cookie_consent_text', 'textarea', 'We use cookies to improve your digital browsing experience.', 'আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে আমরা কুকি ব্যবহার করি।'),
    (v_section_id, 'announcement_banner', 'text', 'Welcome to Rongdhono Content Studio 2.0!', 'রংধনু কন্টেন্ট স্টুডিও ২.০-তে আপনাকে স্বাগতম!'),
    (v_section_id, 'maintenance_mode', 'boolean', 'false', 'false')
    ON CONFLICT (section_id, field_key) DO NOTHING;

    -- Global Section: Navigation
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (v_global_page_id, 'navigation', 'NavbarBuilder', 1)
    ON CONFLICT (page_id, section_key) DO UPDATE SET component_type = 'NavbarBuilder'
    RETURNING id INTO v_section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (v_section_id, 'menu_items', 'json', 
     '[{"label_en":"Home","label_bn":"হোম","href":"/"},{"label_en":"About","label_bn":"আমাদের সম্পর্কে","href":"/about"},{"label_en":"Exhibitions","label_bn":"প্রদর্শনী সমূহ","href":"/exhibitions"},{"label_en":"Gallery","label_bn":"অ্যালবাম","href":"/gallery"},{"label_en":"Catalogs","label_bn":"ক্যাটালগ","href":"/catalogs"},{"label_en":"Contact","label_bn":"যোগাযোগ","href":"/contact"}]',
     '[{"label_en":"Home","label_bn":"হোম","href":"/"},{"label_en":"About","label_bn":"আমাদের সম্পর্কে","href":"/about"},{"label_en":"Exhibitions","label_bn":"প্রদর্শনী সমূহ","href":"/exhibitions"},{"label_en":"Gallery","label_bn":"অ্যালবাম","href":"/gallery"},{"label_en":"Catalogs","label_bn":"ক্যাটালগ","href":"/catalogs"},{"label_en":"Contact","label_bn":"যোগাযোগ","href":"/contact"}]')
    ON CONFLICT (section_id, field_key) DO NOTHING;

    -- Global Section: Footer
    INSERT INTO cms_sections (page_id, section_key, component_type, display_order)
    VALUES (v_global_page_id, 'footer', 'FooterBuilder', 2)
    ON CONFLICT (page_id, section_key) DO UPDATE SET component_type = 'FooterBuilder'
    RETURNING id INTO v_section_id;

    INSERT INTO cms_content (section_id, field_key, field_type, value_en, value_bn) VALUES
    (v_section_id, 'brand_description', 'textarea', 
     'Cultivating contemporary art and preserving cultural heritage through annual exhibitions, fostering a thriving ecosystem for artists.',
     'বার্ষিক প্রদর্শনীর মাধ্যমে সমসাময়িক চারুকলার চর্চা এবং সাংস্কৃতিক ঐতিহ্যকে ধারণ করা।'),
    (v_section_id, 'address', 'textarea', 'Opposite Rabindra Bhavan, Berhampore, West Bengal, India', 'রবীন্দ্র ভবনের বিপরীতে, বহরমপুর, পশ্চিমবঙ্গ, ভারত'),
    (v_section_id, 'phone', 'text', '+91 98765 43210', '+91 98765 43210'),
    (v_section_id, 'email', 'text', 'contact@rongdhono.org', 'contact@rongdhono.org'),
    (v_section_id, 'social_facebook', 'text', 'https://facebook.com', 'https://facebook.com'),
    (v_section_id, 'social_instagram', 'text', 'https://instagram.com', 'https://instagram.com'),
    (v_section_id, 'social_twitter', 'text', 'https://twitter.com', 'https://twitter.com'),
    (v_section_id, 'quick_links', 'json', 
     '[{"label_en":"Home","label_bn":"হোম","href":"/"},{"label_en":"About","label_bn":"আমাদের সম্পর্কে","href":"/about"},{"label_en":"Exhibitions","label_bn":"প্রদর্শনী সমূহ","href":"/exhibitions"}]',
     '[{"label_en":"Home","label_bn":"হোম","href":"/"},{"label_en":"About","label_bn":"আমাদের সম্পর্কে","href":"/about"},{"label_en":"Exhibitions","label_bn":"প্রদর্শনী সমূহ","href":"/exhibitions"}]'),
    (v_section_id, 'legal_links', 'json',
     '[{"label_en":"Privacy Policy","label_bn":"গোপনীয়তা নীতি","href":"/privacy"},{"label_en":"Terms of Service","label_bn":"পরিষেবার শর্তাবলী","href":"/terms"}]',
     '[{"label_en":"Privacy Policy","label_bn":"গোপনীয়তা নীতি","href":"/privacy"},{"label_en":"Terms of Service","label_bn":"পরিষেবার শর্তাবলী","href":"/terms"}]')
    ON CONFLICT (section_id, field_key) DO NOTHING;
END $$;
