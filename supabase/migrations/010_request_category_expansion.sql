-- House of Seams: widen the request-category CHECK for the expansion plan
-- Run this in Supabase SQL Editor AFTER 009_garment_designs.sql.
--
-- 008 introduced custom_design_requests.category with only the original
-- four slugs. The expansion plan (kurti live now; bottoms, salwar_suit,
-- anarkali, langa_voni, pattu_pavadai, gown, petticoat to follow) needs
-- the full set — widened ONCE here, mirroring garment_designs' CHECK, so
-- later phases ship without further migrations on this column. The app
-- (REQUEST_CATEGORIES + the manifest) remains the gatekeeper for which
-- categories actually accept submissions.

ALTER TABLE custom_design_requests
  DROP CONSTRAINT IF EXISTS custom_design_requests_category_check;
ALTER TABLE custom_design_requests
  ADD CONSTRAINT custom_design_requests_category_check
  CHECK (category IN (
    'blouse', 'lehenga', 'shirt', 'trousers',
    'kurti', 'bottoms', 'salwar_suit', 'anarkali',
    'langa_voni', 'pattu_pavadai', 'gown', 'petticoat'
  ));
