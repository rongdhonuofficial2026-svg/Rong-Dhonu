-- Migration: Add column aliases to align with database audit requirements
ALTER TABLE gallery_media
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_url TEXT,
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill data
UPDATE gallery_media
SET 
  featured = COALESCE(is_featured, false),
  public_url = url,
  created_by = uploaded_by;

-- Trigger to sync aliases on insert/update
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
    END IF;
    IF NEW.uploaded_by IS NOT NULL THEN
      NEW.created_by := NEW.uploaded_by;
    END IF;
  ELSE
    -- On update, sync values
    IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
      NEW.featured := NEW.is_featured;
    ELSIF NEW.featured IS DISTINCT FROM OLD.featured THEN
      NEW.is_featured := NEW.featured;
    END IF;

    IF NEW.url IS DISTINCT FROM OLD.url THEN
      NEW.public_url := NEW.url;
    ELSIF NEW.public_url IS DISTINCT FROM OLD.public_url THEN
      NEW.url := NEW.public_url;
    END IF;

    IF NEW.uploaded_by IS DISTINCT FROM OLD.uploaded_by THEN
      NEW.created_by := NEW.uploaded_by;
    ELSIF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
      NEW.uploaded_by := NEW.created_by;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_gallery_media_aliases ON gallery_media;
CREATE TRIGGER trg_sync_gallery_media_aliases
BEFORE INSERT OR UPDATE ON gallery_media
FOR EACH ROW EXECUTE FUNCTION sync_gallery_media_aliases();
