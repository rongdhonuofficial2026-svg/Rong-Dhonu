-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_global_settings BEFORE UPDATE ON global_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_cms_content BEFORE UPDATE ON cms_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_exhibitions BEFORE UPDATE ON exhibitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_participants BEFORE UPDATE ON exhibition_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_artworks BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile on auth user signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name_en, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION log_artwork_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
    VALUES (
      auth.uid(), 
      'artwork_status_changed', 
      'artwork', 
      NEW.id, 
      json_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_artwork_status_change
  AFTER UPDATE ON artworks
  FOR EACH ROW EXECUTE PROCEDURE log_artwork_status_change();

-- Full Text Search helper (English & Bengali combined vector)
-- We use English dictionary for English fields. Bengali FTS is limited in standard Postgres, so we use 'simple' dictionary.
ALTER TABLE artworks ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title_bn, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(medium_en, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(medium_bn, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description_en, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description_bn, '')), 'C')
) STORED;

CREATE INDEX idx_artworks_fts ON artworks USING GIN (fts);
