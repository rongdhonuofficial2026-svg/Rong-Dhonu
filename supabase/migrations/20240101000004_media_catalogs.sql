-- gallery_media table
CREATE TABLE gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    media_type media_type NOT NULL,
    url TEXT NOT NULL,
    caption_en TEXT,
    caption_bn TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- catalogs table
CREATE TABLE catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    cover_image_url TEXT,
    url_en TEXT,
    url_bn TEXT,
    is_auto_generated BOOLEAN DEFAULT false,
    file_size_mb NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exhibition_id, year)
);

-- notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message_en TEXT NOT NULL,
    message_bn TEXT NOT NULL,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gallery_exhibition ON gallery_media(exhibition_id);
CREATE INDEX idx_gallery_category ON gallery_media(category);
CREATE INDEX idx_catalogs_exhibition ON catalogs(exhibition_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
