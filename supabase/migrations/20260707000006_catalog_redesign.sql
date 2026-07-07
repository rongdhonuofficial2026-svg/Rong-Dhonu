-- Drop old catalogs table and related objects safely (was empty)
DROP TABLE IF EXISTS catalogs CASCADE;

-- Create redesigned catalogs table
CREATE TABLE catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID UNIQUE NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_bn TEXT,
    description_en TEXT,
    description_bn TEXT,
    pdf_url TEXT NOT NULL,
    language TEXT DEFAULT 'bilingual',
    version TEXT DEFAULT '1.0',
    file_size BIGINT,
    page_count INTEGER,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    total_downloads INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_catalogs_exhibition_id ON catalogs(exhibition_id);
CREATE INDEX idx_catalogs_status ON catalogs(status);

-- Enable RLS
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Public can read published catalogs
CREATE POLICY "Public can view published catalogs" ON catalogs
    FOR SELECT
    USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins have full access to catalogs" ON catalogs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'owner', 'committee')
        )
    );

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalogs', 'catalogs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for catalogs bucket
DROP POLICY IF EXISTS "Catalogs are publicly accessible" ON storage.objects;
CREATE POLICY "Catalogs are publicly accessible" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'catalogs');

DROP POLICY IF EXISTS "Admins can upload catalogs" ON storage.objects;
CREATE POLICY "Admins can upload catalogs" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'catalogs' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'owner', 'committee')
        )
    );

DROP POLICY IF EXISTS "Admins can update catalogs" ON storage.objects;
CREATE POLICY "Admins can update catalogs" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'catalogs' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'owner', 'committee')
        )
    );

DROP POLICY IF EXISTS "Admins can delete catalogs" ON storage.objects;
CREATE POLICY "Admins can delete catalogs" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'catalogs' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'owner', 'committee')
        )
    );
