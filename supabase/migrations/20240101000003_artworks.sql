-- exhibition_participants table
CREATE TABLE exhibition_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status participant_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exhibition_id, artist_id)
);

-- artworks table
CREATE TABLE artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    medium_en TEXT NOT NULL,
    medium_bn TEXT NOT NULL,
    materials_en TEXT NOT NULL,
    materials_bn TEXT NOT NULL,
    dimensions TEXT NOT NULL,
    weight TEXT,
    creation_date DATE,
    category TEXT,
    theme TEXT,
    orientation TEXT,
    framed BOOLEAN DEFAULT false,
    price NUMERIC,
    insurance_value NUMERIC,
    availability availability_status DEFAULT 'not_for_sale',
    display_location TEXT,
    notes TEXT,
    status artwork_status DEFAULT 'pending',
    gdrive_backup_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- artwork_images table (normalized)
CREATE TABLE artwork_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'main', 'detail_1', 'certificate'
    url_thumbnail TEXT,
    url_medium TEXT,
    url_high TEXT,
    url_zoom TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_participants_exhibition ON exhibition_participants(exhibition_id);
CREATE INDEX idx_participants_artist ON exhibition_participants(artist_id);
CREATE INDEX idx_participants_status ON exhibition_participants(status);
CREATE INDEX idx_artworks_exhibition ON artworks(exhibition_id);
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artwork_images_artwork ON artwork_images(artwork_id);
