-- Alter Catalogs for DMS
ALTER TABLE catalogs DROP CONSTRAINT IF EXISTS catalogs_exhibition_id_year_key;

ALTER TABLE catalogs 
  DROP COLUMN IF EXISTS url_en,
  DROP COLUMN IF EXISTS url_bn,
  DROP COLUMN IF EXISTS is_auto_generated,
  DROP COLUMN IF EXISTS file_size_mb;

ALTER TABLE catalogs 
  ADD COLUMN title_en TEXT NOT NULL DEFAULT 'Untitled',
  ADD COLUMN title_bn TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN description_bn TEXT,
  ADD COLUMN pdf_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN language TEXT NOT NULL DEFAULT 'bilingual',
  ADD COLUMN version TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN change_notes TEXT,
  ADD COLUMN uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN total_downloads INTEGER DEFAULT 0,
  ADD COLUMN last_download_at TIMESTAMPTZ;

-- Remove the default empty string for pdf_url after adding
ALTER TABLE catalogs ALTER COLUMN pdf_url DROP DEFAULT;
ALTER TABLE catalogs ALTER COLUMN title_en DROP DEFAULT;

-- Partial unique index for published catalogs
CREATE UNIQUE INDEX idx_unique_published_catalog ON catalogs (exhibition_id, language) WHERE status = 'published';

-- Alter Profiles for Notification Preferences
ALTER TABLE profiles 
  ADD COLUMN notify_email BOOLEAN DEFAULT true,
  ADD COLUMN notify_in_app BOOLEAN DEFAULT true,
  ADD COLUMN notify_exhibition_announcements BOOLEAN DEFAULT true,
  ADD COLUMN notify_deadline_reminders BOOLEAN DEFAULT true,
  ADD COLUMN notify_artwork_updates BOOLEAN DEFAULT true;

-- Update RLS for catalogs
DROP POLICY IF EXISTS "Public can view catalogs" ON catalogs;
CREATE POLICY "Public can view published catalogs" 
ON catalogs FOR SELECT 
TO public 
USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage catalogs" ON catalogs;
CREATE POLICY "Admins can manage catalogs" 
ON catalogs FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'committee')
  )
);
