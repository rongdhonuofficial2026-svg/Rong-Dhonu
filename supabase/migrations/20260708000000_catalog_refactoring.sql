-- 1. Drop existing UNIQUE constraint on exhibition_id (implied constraint name is catalogs_exhibition_id_key)
ALTER TABLE catalogs DROP CONSTRAINT IF EXISTS catalogs_exhibition_id_key;

-- 2. Add new columns to support covers, publishing metadata, and category classifications
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS last_download_at TIMESTAMPTZ;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'exhibition' CHECK (category IN ('exhibition', 'retrospective', 'solo', 'group', 'other'));

-- 3. Create partial unique index to guarantee only one version is published per exhibition
DROP INDEX IF EXISTS idx_unique_published_catalog_per_exhibition;
CREATE UNIQUE INDEX idx_unique_published_catalog_per_exhibition 
ON catalogs (exhibition_id) 
WHERE (status = 'published');

-- 4. Create the download analytics log table
CREATE TABLE IF NOT EXISTS catalog_download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    country TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast analytics lookups
CREATE INDEX IF NOT EXISTS idx_catalog_download_logs_catalog_id ON catalog_download_logs(catalog_id);

-- 5. Trigger function to update total_downloads and last_download_at in catalogs table automatically
CREATE OR REPLACE FUNCTION update_catalog_downloads_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE catalogs
    SET 
        total_downloads = (
            SELECT COUNT(*) 
            FROM catalog_download_logs 
            WHERE catalog_download_logs.catalog_id = NEW.catalog_id
        ),
        last_download_at = NEW.downloaded_at
    WHERE id = NEW.catalog_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_catalog_downloads_count ON catalog_download_logs;
CREATE TRIGGER trigger_update_catalog_downloads_count
AFTER INSERT ON catalog_download_logs
FOR EACH ROW
EXECUTE FUNCTION update_catalog_downloads_count();

-- 6. Transactional publish RPC function
CREATE OR REPLACE FUNCTION publish_catalog_transaction(
    p_catalog_id UUID,
    p_admin_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exhibition_id UUID;
BEGIN
    -- Get the exhibition ID of the target catalog
    SELECT exhibition_id INTO v_exhibition_id
    FROM catalogs
    WHERE id = p_catalog_id;

    IF v_exhibition_id IS NULL THEN
        RAISE EXCEPTION 'Catalog not found';
    END IF;

    -- Archive all other published catalogs for this exhibition
    UPDATE catalogs
    SET 
        status = 'archived',
        archived_at = NOW(),
        updated_at = NOW()
    WHERE exhibition_id = v_exhibition_id
      AND id != p_catalog_id
      AND status = 'published';

    -- Publish the target catalog
    UPDATE catalogs
    SET 
        status = 'published',
        published_at = NOW(),
        published_by = p_admin_id,
        archived_at = NULL,
        updated_at = NOW()
    WHERE id = p_catalog_id;
END;
$$;

-- 7. Secure download tracking RPC function (inserts into logs)
CREATE OR REPLACE FUNCTION increment_catalog_downloads(
    catalog_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_ip TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO catalog_download_logs (catalog_id, user_id, ip_address, country)
    VALUES (catalog_id, p_user_id, p_ip, p_country);
END;
$$;

-- Grant permissions to anonymous and authenticated users for download logging
GRANT EXECUTE ON FUNCTION increment_catalog_downloads(UUID, UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_catalog_downloads(UUID, UUID, TEXT, TEXT) TO authenticated;

-- 8. Enable Row Level Security (RLS) for the analytics table
ALTER TABLE catalog_download_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert download logs" ON catalog_download_logs;
CREATE POLICY "Anyone can insert download logs" ON catalog_download_logs
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view download logs" ON catalog_download_logs;
CREATE POLICY "Admins can view download logs" ON catalog_download_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'owner', 'committee')
        )
    );
