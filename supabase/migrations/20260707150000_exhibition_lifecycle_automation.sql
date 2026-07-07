-- 1. Add missing ENUM values (if they don't exist)
ALTER TYPE exhibition_status ADD VALUE IF NOT EXISTS 'upcoming';
ALTER TYPE exhibition_status ADD VALUE IF NOT EXISTS 'ongoing';

-- 2. Add Analytics tracking columns to exhibitions
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS registration_count INTEGER DEFAULT 0;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS approved_artists_count INTEGER DEFAULT 0;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_views_count INTEGER DEFAULT 0;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS catalog_downloads_count INTEGER DEFAULT 0;

-- 3. Trigger: Automatically insert/update exhibition_participants when artwork is approved
CREATE OR REPLACE FUNCTION sync_artist_participation()
RETURNS TRIGGER AS $$
BEGIN
  -- If an artwork is marked as 'approved'
  IF NEW.status = 'approved' THEN
    -- Upsert the participant record
    INSERT INTO exhibition_participants (exhibition_id, artist_id, status, created_at, updated_at)
    VALUES (NEW.exhibition_id, NEW.artist_id, 'approved'::participant_status, NOW(), NOW())
    ON CONFLICT (exhibition_id, artist_id) 
    DO UPDATE SET status = 'approved'::participant_status, updated_at = NOW();

    -- Update exhibition approved_artists_count (recalculate based on unique approved participants)
    UPDATE exhibitions 
    SET approved_artists_count = (
      SELECT COUNT(DISTINCT artist_id) 
      FROM exhibition_participants 
      WHERE exhibition_id = NEW.exhibition_id AND status = 'approved'::participant_status
    )
    WHERE id = NEW.exhibition_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to allow re-running
DROP TRIGGER IF EXISTS trigger_sync_artist_participation ON artworks;

CREATE TRIGGER trigger_sync_artist_participation
AFTER INSERT OR UPDATE OF status ON artworks
FOR EACH ROW
EXECUTE FUNCTION sync_artist_participation();

-- 4. Initial backfill for existing approved artworks
INSERT INTO exhibition_participants (exhibition_id, artist_id, status)
SELECT DISTINCT exhibition_id, artist_id, 'approved'::participant_status
FROM artworks
WHERE status = 'approved'
ON CONFLICT (exhibition_id, artist_id) DO NOTHING;

UPDATE exhibitions e
SET approved_artists_count = (
  SELECT COUNT(DISTINCT artist_id)
  FROM exhibition_participants p
  WHERE p.exhibition_id = e.id AND p.status = 'approved'::participant_status
);
