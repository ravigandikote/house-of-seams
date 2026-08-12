-- House of Seams: sewing-pattern profiles (the Pattern Shop)
-- Run this in Supabase SQL Editor AFTER 010_request_category_expansion.sql,
-- then run supabase/seed_pattern_profiles.sql for the standard catalog.
--
-- Shopify is the source of truth for price/purchase/delivery; this table
-- is OUR presentation layer, joined to Shopify products at runtime on
-- shopify_handle. A profile with no matching product renders as
-- "coming soon" on the site. Keep the category CHECK in sync with
-- PATTERN_CATEGORIES in src/types/pattern.ts.

CREATE TABLE IF NOT EXISTS pattern_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'blouse', 'lehenga', 'kurti', 'bottoms', 'salwar_suit', 'anarkali',
    'langa_voni', 'pattu_pavadai', 'gown', 'petticoat', 'foundational'
  )),
  -- e.g. princess_cut, kalidar_8, bodice_block
  pattern_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  size_range TEXT NOT NULL,
  -- {a4: bool, a0: bool, projector: bool}
  formats JSONB NOT NULL DEFAULT '{"a4": true, "a0": true, "projector": false}',
  fabric_notes TEXT,
  -- ["Layered PDF pattern", ...]
  whats_included JSONB NOT NULL DEFAULT '[]',
  -- {renderer: 'blouse'|'lehenga'|'kurti'|'bottoms', style: {...enums, base_color}}
  preview_config JSONB NOT NULL,
  -- design slugs (blouse_designs.slug / garment_designs.slug) whose
  -- customizer preview step should surface this pattern
  related_design_slugs JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_pattern_profiles_updated_at BEFORE UPDATE ON pattern_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pattern_profiles ENABLE ROW LEVEL SECURITY;

-- Content table: public read; writes only via the service-role client.
CREATE POLICY "Public read pattern_profiles" ON pattern_profiles FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_pattern_profiles_category ON pattern_profiles(category, is_active, sort_order);
