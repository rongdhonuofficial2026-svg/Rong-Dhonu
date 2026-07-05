-- ENUMs
CREATE TYPE user_role AS ENUM ('admin', 'member', 'committee');
CREATE TYPE exhibition_status AS ENUM ('draft', 'registration_open', 'submission_open', 'submission_closed', 'reviewing', 'published', 'archived');
CREATE TYPE artwork_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE availability_status AS ENUM ('available', 'sold', 'not_for_sale');
CREATE TYPE notification_type AS ENUM ('registration_approved', 'submission_received', 'submission_approved', 'submission_rejected', 'deadline_reminder', 'catalog_published', 'new_exhibition');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE participant_status AS ENUM ('pending', 'approved', 'rejected');

-- global_settings table
CREATE TABLE global_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- cms_content table
CREATE TABLE cms_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    content_en JSONB NOT NULL,
    content_bn JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page, section)
);

-- profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    slug TEXT UNIQUE,
    full_name_en TEXT,
    full_name_bn TEXT,
    bio_en TEXT,
    bio_bn TEXT,
    avatar_url TEXT,
    social_links JSONB,
    awards JSONB,
    statistics JSONB,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_slug ON profiles(slug);
