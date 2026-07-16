-- House of Seams: Full standard blouse measurement set + customer preferences
-- Run this in Supabase SQL Editor AFTER 002_blouse_customizer.sql
--
-- Expands the 8 original measurements to the boutique's 23-field standard
-- guide, and adds an "additional details" preferences JSONB to requests.

-- ============================================================
-- MEASUREMENT DEFAULTS: 15 new columns (inches)
-- ============================================================

ALTER TABLE measurement_defaults
  ADD COLUMN IF NOT EXISTS across_front NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS across_back NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS upper_bust NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS under_bust NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS apex_to_apex NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS shoulder_to_apex NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS shoulder_to_under_bust NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS neck_width NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS sleeve_round NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS elbow_round NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS wrist_round NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS front_length NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS back_length NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS side_seam_length NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS hip NUMERIC(5,2);

-- Backfill the seeded brackets with placeholder starting values
-- (matched by age_min; no-ops if the brackets were renamed/removed).
-- !!! PLACEHOLDER VALUES — the boutique should review in Admin > Measurements.

UPDATE measurement_defaults SET
  across_front = 12.5, across_back = 13, upper_bust = 31, under_bust = 27,
  apex_to_apex = 6.5, shoulder_to_apex = 9, shoulder_to_under_bust = 14,
  neck_width = 13.5, sleeve_round = 10, elbow_round = 9, wrist_round = 6,
  front_length = 14, back_length = 14.5, side_seam_length = 7.5, hip = 34
WHERE age_min = 13 AND across_front IS NULL;

UPDATE measurement_defaults SET
  across_front = 13, across_back = 13.5, upper_bust = 33, under_bust = 29,
  apex_to_apex = 7, shoulder_to_apex = 9.5, shoulder_to_under_bust = 15,
  neck_width = 14, sleeve_round = 11, elbow_round = 9.5, wrist_round = 6.5,
  front_length = 14.5, back_length = 15, side_seam_length = 8, hip = 36
WHERE age_min = 18 AND across_front IS NULL;

UPDATE measurement_defaults SET
  across_front = 13.5, across_back = 14, upper_bust = 35, under_bust = 31,
  apex_to_apex = 7.5, shoulder_to_apex = 10, shoulder_to_under_bust = 15.5,
  neck_width = 14.5, sleeve_round = 12, elbow_round = 10, wrist_round = 7,
  front_length = 15, back_length = 15.5, side_seam_length = 8.5, hip = 39
WHERE age_min = 26 AND across_front IS NULL;

UPDATE measurement_defaults SET
  across_front = 14, across_back = 14.5, upper_bust = 37, under_bust = 33,
  apex_to_apex = 8, shoulder_to_apex = 10.5, shoulder_to_under_bust = 16,
  neck_width = 15, sleeve_round = 13, elbow_round = 10.5, wrist_round = 7.5,
  front_length = 15.5, back_length = 16, side_seam_length = 9, hip = 42
WHERE age_min = 41 AND across_front IS NULL;

-- ============================================================
-- CUSTOM DESIGN REQUESTS: additional-details preferences
-- ============================================================
-- JSONB: { bra_size, blouse_opening, cup_padding, fit_preference,
--          seam_allowance } — allowed values enforced by the API
-- (src/types/customDesignRequest.ts is the source of truth).

ALTER TABLE custom_design_requests
  ADD COLUMN IF NOT EXISTS preferences JSONB;
