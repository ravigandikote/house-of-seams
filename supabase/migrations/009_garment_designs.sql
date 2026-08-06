-- House of Seams: generic designs storage for all NEW categories
-- Run this in Supabase SQL Editor AFTER 008_request_category.sql.
--
-- blouse_designs stays as-is (blouse keeps its dedicated table + admin
-- section). Every category added by the expansion plan stores its
-- pickable designs here instead of getting its own table. Style values
-- inside style_attributes are validated server-side against each
-- category's `as const` enums via the manifest
-- (src/types/customizerCategories.ts + src/lib/garmentStyles.ts) — the
-- CHECK below only constrains the category slugs themselves.

CREATE TABLE IF NOT EXISTS garment_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'lehenga', 'kurti', 'bottoms', 'salwar_suit', 'anarkali',
    'langa_voni', 'pattu_pavadai', 'gown', 'petticoat'
  )),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  -- Category-specific style enums + base_color, snake_cased keys
  style_attributes JSONB NOT NULL,
  -- Kavya's hero pieces, surfaced first in the customizer
  is_signature BOOLEAN DEFAULT FALSE,
  -- Her one-line styling note shown with the design
  designer_note TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category, slug)
);

CREATE TRIGGER update_garment_designs_updated_at BEFORE UPDATE ON garment_designs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE garment_designs ENABLE ROW LEVEL SECURITY;

-- Content table: public read; writes only via the service-role client.
CREATE POLICY "Public read garment_designs" ON garment_designs FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_garment_designs_category ON garment_designs(category, is_active, sort_order);
