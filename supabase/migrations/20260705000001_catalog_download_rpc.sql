-- Add RPC function for atomic download counter increment
CREATE OR REPLACE FUNCTION increment_catalog_downloads(catalog_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE catalogs
  SET
    total_downloads = COALESCE(total_downloads, 0) + 1,
    last_download_at = NOW()
  WHERE id = catalog_id;
END;
$$;

-- Grant execute to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION increment_catalog_downloads(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_catalog_downloads(UUID) TO authenticated;
