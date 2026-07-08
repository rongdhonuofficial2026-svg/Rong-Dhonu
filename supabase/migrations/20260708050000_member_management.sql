-- Add status, is_verified, and last_login columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Recreate index for status
DROP INDEX IF EXISTS idx_profiles_status;
CREATE INDEX idx_profiles_status ON profiles(status);
