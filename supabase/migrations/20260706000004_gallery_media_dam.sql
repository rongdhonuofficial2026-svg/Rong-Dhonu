-- Extend gallery_media table for Digital Asset Management (DAM)
ALTER TABLE gallery_media
ADD COLUMN title_en TEXT,
ADD COLUMN title_bn TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_bn TEXT,
ADD COLUMN alt_text TEXT,
ADD COLUMN original_file_name TEXT,
ADD COLUMN mime_type TEXT,
ADD COLUMN size_bytes BIGINT,
ADD COLUMN width INTEGER,
ADD COLUMN height INTEGER,
ADD COLUMN duration INTEGER,
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN sort_order INTEGER DEFAULT 0,
ADD COLUMN photographer TEXT,
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_gallery_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gallery_media_updated_at ON gallery_media;
CREATE TRIGGER trg_gallery_media_updated_at
BEFORE UPDATE ON gallery_media
FOR EACH ROW EXECUTE FUNCTION update_gallery_media_updated_at();

-- Add some new indices for performance
CREATE INDEX IF NOT EXISTS idx_gallery_status ON gallery_media(status);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery_media(is_featured);
