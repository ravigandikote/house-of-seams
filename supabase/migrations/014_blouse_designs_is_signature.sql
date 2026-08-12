-- House of Seams — signature flag for blouse designs.
-- Run in the Supabase SQL Editor AFTER 013_blouse_allowed_variations.sql.
--
-- The blouse gallery currently orders by sort_order alone. garment_designs
-- has carried is_signature since 009; this brings blouse_designs in line so
-- the customizer can float Kavya's signature cuts to the top of step 1
-- without her having to keep dragging them there by hand.
--
-- Default FALSE, so every existing row keeps its current position and the
-- gallery order is unchanged until she stars something.

ALTER TABLE blouse_designs
  ADD COLUMN IF NOT EXISTS is_signature BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN blouse_designs.is_signature IS
  'Signature cuts sort ahead of everything else in the customizer gallery; sort_order still orders within each group.';

-- Matches the gallery''s ORDER BY (is_signature DESC, sort_order ASC) so
-- the list query stays a single index scan as the catalogue grows.
CREATE INDEX IF NOT EXISTS blouse_designs_signature_order_idx
  ON blouse_designs (is_signature DESC, sort_order ASC)
  WHERE is_active = TRUE;
