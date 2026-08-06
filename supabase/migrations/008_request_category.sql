-- House of Seams: category on custom design requests
-- Run this in Supabase SQL Editor AFTER 007_sketch_annotations.sql.
--
-- The customizer now submits lehengas as well as blouses through the same
-- request pipeline (shared Design Story, admin panel, annotations).
-- Existing rows are all blouses — the DEFAULT backfills them correctly.
-- Keep in sync with REQUEST_CATEGORIES in src/types/customDesignRequest.ts.

ALTER TABLE custom_design_requests
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'blouse'
  CHECK (category IN ('blouse', 'lehenga', 'shirt', 'trousers'));

CREATE INDEX IF NOT EXISTS idx_custom_design_requests_category
  ON custom_design_requests(category);
