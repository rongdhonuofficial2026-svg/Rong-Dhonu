CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'subscribed' NOT NULL CHECK (status IN ('subscribed', 'unsubscribed')),
    source_page TEXT CHECK (source_page IN ('homepage', 'footer', 'contact', 'future expansion')),
    locale TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_subscribers' AND policyname = 'Allow anonymous subscriber insertion'
    ) THEN
        CREATE POLICY "Allow anonymous subscriber insertion" 
        ON newsletter_subscribers 
        FOR INSERT 
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_subscribers' AND policyname = 'Allow admins to manage subscribers'
    ) THEN
        CREATE POLICY "Allow admins to manage subscribers" 
        ON newsletter_subscribers 
        FOR ALL 
        USING (is_admin());
    END IF;
END $$;
