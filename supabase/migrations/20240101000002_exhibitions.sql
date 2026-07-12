-- exhibitions table
CREATE TABLE exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    theme_en TEXT NOT NULL,
    theme_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    status exhibition_status DEFAULT 'draft',
    registration_start TIMESTAMPTZ,
    submission_end TIMESTAMPTZ,
    exhibition_start TIMESTAMPTZ,
    exhibition_end TIMESTAMPTZ,
    venue_en TEXT,
    venue_bn TEXT,
    hero_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- committee_members table
CREATE TABLE committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_en TEXT NOT NULL,
    role_bn TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exhibition_id, profile_id)
);

-- events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    date_time TIMESTAMPTZ NOT NULL,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    speaker_en TEXT,
    speaker_bn TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exhibitions_year ON exhibitions(year);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_committee_exhibition ON committee_members(exhibition_id);
CREATE INDEX idx_committee_profile ON committee_members(profile_id);
CREATE INDEX idx_events_exhibition ON events(exhibition_id);
