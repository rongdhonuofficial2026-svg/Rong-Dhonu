-- Add soft delete capability to exhibitions
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add index to speed up filtering of deleted exhibitions
CREATE INDEX IF NOT EXISTS idx_exhibitions_is_deleted ON exhibitions(is_deleted);
