-- Add is_featured column if it doesn't exist
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Migrate 'active' -> 'ongoing' for lifecycle alignment
UPDATE exhibitions SET status = 'ongoing' WHERE status = 'active';

-- Migrate 'completed' -> 'archived'
UPDATE exhibitions SET status = 'archived' WHERE status = 'completed';
