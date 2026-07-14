-- House of Seams: Blouse Customizer
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql
-- (relies on the update_updated_at() function defined there)

-- ============================================================
-- CONTENT TABLES (public read, admin write via service role)
-- ============================================================

-- Catalogue of selectable, pre-made blouse designs.
-- Structured style attributes drive the SVG preview renderer.
-- Allowed values here must stay in sync with the TS unions in
-- src/types/blouseDesign.ts (single source of truth for the UI).
CREATE TABLE IF NOT EXISTS blouse_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  -- Optional thumbnail. If used, must be a Supabase Storage URL —
  -- do NOT point this at /images/uploads (fs uploads don't persist on Vercel).
  thumbnail_url TEXT,
  neck_style TEXT DEFAULT 'round' CHECK (neck_style IN ('round', 'v', 'sweetheart', 'high', 'boat', 'square')),
  back_style TEXT DEFAULT 'round' CHECK (back_style IN ('round', 'deep-round', 'v', 'keyhole', 'tie')),
  sleeve_style TEXT DEFAULT 'short' CHECK (sleeve_style IN ('sleeveless', 'cap', 'short', 'elbow', 'three-quarter', 'full')),
  closure TEXT DEFAULT 'hook' CHECK (closure IN ('hook', 'zip', 'tie', 'button')),
  embellishment TEXT DEFAULT 'plain' CHECK (embellishment IN ('plain', 'embroidery', 'zari', 'sequin', 'mirror', 'stone')),
  base_color TEXT DEFAULT '#D6A6B1',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Age-bracket -> default measurements (inches). Rough pre-fill values
-- only; the customer edits everything. Admin-editable so the boutique
-- can tune the brackets.
CREATE TABLE IF NOT EXISTS measurement_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  age_min INTEGER NOT NULL,
  age_max INTEGER NOT NULL,
  bust NUMERIC(5,2),
  waist NUMERIC(5,2),
  shoulder_width NUMERIC(5,2),
  blouse_length NUMERIC(5,2),
  sleeve_length NUMERIC(5,2),
  armhole NUMERIC(5,2),
  front_neck_depth NUMERIC(5,2),
  back_neck_depth NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REQUEST TABLE (public insert, owner/service-role read)
-- ============================================================

-- A submitted customization. design_snapshot denormalises the design
-- attributes at submit time so the request survives design edits/deletes.
-- customer_* contact columns support guest submissions (user_id nullable),
-- mirroring how bookings capture contact details.
CREATE TABLE IF NOT EXISTS custom_design_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  design_id UUID REFERENCES blouse_designs(id) ON DELETE SET NULL,
  design_snapshot JSONB NOT NULL,
  measurements JSONB NOT NULL,
  selected_color TEXT,
  customer_age INTEGER,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'quoted', 'confirmed', 'cancelled')),
  linked_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_blouse_designs_updated_at BEFORE UPDATE ON blouse_designs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_measurement_defaults_updated_at BEFORE UPDATE ON measurement_defaults FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_custom_design_requests_updated_at BEFORE UPDATE ON custom_design_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE blouse_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_design_requests ENABLE ROW LEVEL SECURITY;

-- Content tables: public read (writes only via service-role client)
CREATE POLICY "Public read blouse_designs" ON blouse_designs FOR SELECT USING (true);
CREATE POLICY "Public read measurement_defaults" ON measurement_defaults FOR SELECT USING (true);

-- Requests: public insert (guests can request a quote, like bookings).
-- Reads restricted to the owning user only — unlike bookings, guest rows
-- (user_id IS NULL) are NOT publicly readable, because requests contain
-- personal measurements and contact details. Admin reads via service role.
CREATE POLICY "Public insert custom_design_requests" ON custom_design_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own custom_design_requests" ON custom_design_requests FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_blouse_designs_slug ON blouse_designs(slug);
CREATE INDEX IF NOT EXISTS idx_blouse_designs_is_active ON blouse_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_blouse_designs_sort_order ON blouse_designs(sort_order);
CREATE INDEX IF NOT EXISTS idx_measurement_defaults_age_min ON measurement_defaults(age_min);
CREATE INDEX IF NOT EXISTS idx_custom_design_requests_user_id ON custom_design_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_design_requests_status ON custom_design_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_design_requests_created_at ON custom_design_requests(created_at DESC);
