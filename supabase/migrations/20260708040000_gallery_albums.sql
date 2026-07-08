-- Migration: Create gallery_albums table and associate gallery_media with it.
-- Enables support for multiple independent albums, manual covers, and SEO metadata.

CREATE TABLE IF NOT EXISTS gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE UNIQUE, -- Enforces exactly one album per exhibition
    category_slug TEXT REFERENCES gallery_categories(slug) ON DELETE SET NULL,
    album_type TEXT NOT NULL CHECK (album_type IN ('exhibition', 'independent')),
    title TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_bn TEXT,
    description_en TEXT,
    description_bn TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    cover_media_id UUID, -- constraint will be added later
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for gallery_albums
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for gallery_albums
DROP POLICY IF EXISTS "Public can view published gallery albums" ON gallery_albums;
CREATE POLICY "Public can view published gallery albums" ON gallery_albums 
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage gallery albums" ON gallery_albums;
CREATE POLICY "Admins can manage gallery albums" ON gallery_albums 
    USING (is_admin());

-- Index for category_slug on albums
DROP INDEX IF EXISTS idx_gallery_albums_category_slug;
CREATE INDEX idx_gallery_albums_category_slug ON gallery_albums(category_slug);

-- Add alias/compatibility columns to gallery_media if they do not exist
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS visibility TEXT CHECK (visibility IN ('public', 'hidden'));

-- Backfill helper columns in gallery_media
UPDATE gallery_media 
SET 
  file_url = url,
  thumbnail = thumbnail_url,
  caption = caption_en,
  visibility = CASE WHEN status = 'published' THEN 'public' ELSE 'hidden' END;

-- Update the sync trigger function to sync the new alias columns
CREATE OR REPLACE FUNCTION sync_gallery_media_aliases()
RETURNS TRIGGER AS $$
BEGIN
  -- If insert, initialize aliases
  IF (TG_OP = 'INSERT') THEN
    IF NEW.is_featured IS NOT NULL THEN
      NEW.featured := NEW.is_featured;
    END IF;
    IF NEW.url IS NOT NULL THEN
      NEW.public_url := NEW.url;
      NEW.file_url := NEW.url;
    END IF;
    IF NEW.uploaded_by IS NOT NULL THEN
      NEW.created_by := NEW.uploaded_by;
    END IF;
    IF NEW.thumbnail_url IS NOT NULL THEN
      NEW.thumbnail := NEW.thumbnail_url;
    END IF;
    IF NEW.caption_en IS NOT NULL THEN
      NEW.caption := NEW.caption_en;
    END IF;
    IF NEW.status IS NOT NULL THEN
      NEW.visibility := CASE WHEN NEW.status = 'published' THEN 'public' ELSE 'hidden' END;
    END IF;
  ELSE
    -- On update, sync values
    -- Featured
    IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
      NEW.featured := NEW.is_featured;
    ELSIF NEW.featured IS DISTINCT FROM OLD.featured THEN
      NEW.is_featured := NEW.featured;
    END IF;

    -- URL / Public URL / File URL
    IF NEW.url IS DISTINCT FROM OLD.url THEN
      NEW.public_url := NEW.url;
      NEW.file_url := NEW.url;
    ELSIF NEW.public_url IS DISTINCT FROM OLD.public_url THEN
      NEW.url := NEW.public_url;
      NEW.file_url := NEW.public_url;
    ELSIF NEW.file_url IS DISTINCT FROM OLD.file_url THEN
      NEW.url := NEW.file_url;
      NEW.public_url := NEW.file_url;
    END IF;

    -- Created By / Uploaded By
    IF NEW.uploaded_by IS DISTINCT FROM OLD.uploaded_by THEN
      NEW.created_by := NEW.uploaded_by;
    ELSIF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
      NEW.uploaded_by := NEW.created_by;
    END IF;

    -- Thumbnail / Thumbnail URL
    IF NEW.thumbnail_url IS DISTINCT FROM OLD.thumbnail_url THEN
      NEW.thumbnail := NEW.thumbnail_url;
    ELSIF NEW.thumbnail IS DISTINCT FROM OLD.thumbnail THEN
      NEW.thumbnail_url := NEW.thumbnail;
    END IF;

    -- Caption / Caption En
    IF NEW.caption_en IS DISTINCT FROM OLD.caption_en THEN
      NEW.caption := NEW.caption_en;
    ELSIF NEW.caption IS DISTINCT FROM OLD.caption THEN
      NEW.caption_en := NEW.caption;
    END IF;

    -- Visibility / Status
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.visibility := CASE WHEN NEW.status = 'published' THEN 'public' ELSE 'hidden' END;
    ELSIF NEW.visibility IS DISTINCT FROM OLD.visibility THEN
      NEW.status := CASE WHEN NEW.visibility = 'public' THEN 'published' ELSE 'draft' END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for aliases
DROP TRIGGER IF EXISTS trg_sync_gallery_media_aliases ON gallery_media;
CREATE TRIGGER trg_sync_gallery_media_aliases
BEFORE INSERT OR UPDATE ON gallery_media
FOR EACH ROW EXECUTE FUNCTION sync_gallery_media_aliases();

-- Add gallery_album_id to gallery_media
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS gallery_album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE;

-- Backfill Data into gallery_albums
-- 1. Create exhibition albums for existing media linked to exhibitions
INSERT INTO gallery_albums (exhibition_id, album_type, title, title_en, title_bn, description_en, description_bn, slug, status)
SELECT 
    e.id, 
    'exhibition', 
    e.theme_en, 
    e.theme_en, 
    e.theme_bn, 
    e.description_en, 
    e.description_bn, 
    e.id::text, 
    CASE WHEN e.status IN ('ongoing', 'archived') THEN 'published'::text ELSE 'draft'::text END
FROM exhibitions e
WHERE EXISTS (SELECT 1 FROM gallery_media gm WHERE gm.exhibition_id = e.id)
ON CONFLICT (exhibition_id) DO NOTHING;

-- 2. Create independent albums for remaining media grouped by category
INSERT INTO gallery_albums (category_slug, album_type, title, title_en, title_bn, slug, status)
SELECT 
    gc.slug,
    'independent',
    gc.name_en,
    gc.name_en,
    gc.name_bn,
    gc.slug,
    'published'
FROM gallery_categories gc
WHERE EXISTS (SELECT 1 FROM gallery_media gm WHERE gm.category = gc.slug AND gm.exhibition_id IS NULL)
ON CONFLICT (slug) DO NOTHING;

-- 3. Map existing media to the created albums
UPDATE gallery_media gm
SET gallery_album_id = ga.id
FROM gallery_albums ga
WHERE (gm.exhibition_id = ga.exhibition_id) 
   OR (gm.exhibition_id IS NULL AND gm.category = ga.category_slug);

-- 4. Assign remaining media to a default "General Archive" album if gallery_album_id is still null
DO $$
DECLARE
    default_album_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM gallery_media WHERE gallery_album_id IS NULL) THEN
        INSERT INTO gallery_albums (album_type, title, title_en, slug, status)
        VALUES ('independent', 'General Archive', 'General Archive', 'general-archive', 'published')
        ON CONFLICT (slug) DO NOTHING;
        
        SELECT id INTO default_album_id FROM gallery_albums WHERE slug = 'general-archive';
        
        UPDATE gallery_media SET gallery_album_id = default_album_id WHERE gallery_album_id IS NULL;
    END IF;
END $$;

-- 5. Enforce NOT NULL on gallery_album_id
ALTER TABLE gallery_media ALTER COLUMN gallery_album_id SET NOT NULL;

-- 6. Add cover_media_id foreign key constraint to gallery_albums
ALTER TABLE gallery_albums ADD CONSTRAINT fk_gallery_albums_cover_media FOREIGN KEY (cover_media_id) REFERENCES gallery_media(id) ON DELETE SET NULL;

-- 7. Trigger to sync exhibition_id on media inserts/updates for backward compatibility
CREATE OR REPLACE FUNCTION sync_gallery_media_exhibition_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.exhibition_id := (SELECT exhibition_id FROM gallery_albums WHERE id = NEW.gallery_album_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_gallery_media_exhibition_id ON gallery_media;
CREATE TRIGGER trg_sync_gallery_media_exhibition_id
BEFORE INSERT OR UPDATE ON gallery_media
FOR EACH ROW EXECUTE FUNCTION sync_gallery_media_exhibition_id();
