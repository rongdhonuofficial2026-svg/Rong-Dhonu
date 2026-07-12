-- Add curatorial statement columns
ALTER TABLE exhibitions ADD COLUMN curatorial_statement_en TEXT;
ALTER TABLE exhibitions ADD COLUMN curatorial_statement_bn TEXT;

-- Migrate existing description data (which was semantically used as Curatorial Statement)
UPDATE exhibitions SET curatorial_statement_en = description_en, curatorial_statement_bn = description_bn;

-- Clear old descriptions so they can be used for the actual Exhibition Description
UPDATE exhibitions SET description_en = NULL, description_bn = NULL;
