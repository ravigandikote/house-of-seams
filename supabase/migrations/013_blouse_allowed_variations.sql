-- House of Seams — per-design variation constraints for blouse designs.
-- Run in the Supabase SQL Editor AFTER 012_products_shopify_handle.sql.
--
-- Shape: { "sleeves": [...], "necklines": [...], "backs": [...] } — every
-- key optional. Values come from the same enums as the design's own
-- columns (SLEEVE_STYLES / NECK_STYLES / BACK_STYLES in
-- src/types/blouseDesign.ts), which stay the single source of truth and
-- are enforced server-side on write.
--
-- NULL, a missing key, or an empty list all mean "every option allowed",
-- so the existing rows need no backfill and keep offering the full range.
--
-- The keys are single words, so they are identical in snake_case and
-- camelCase — caseTransform passes them through untouched in both
-- directions, as it does the hyphenated values ('three-quarter').

ALTER TABLE blouse_designs
  ADD COLUMN IF NOT EXISTS allowed_variations JSONB;

COMMENT ON COLUMN blouse_designs.allowed_variations IS
  'Optional per-design variation whitelist: {"sleeves":[],"necklines":[],"backs":[]}. NULL/missing/empty = all options allowed.';

-- Shape guard only — the allowed *values* are validated in the API
-- against the TS enums, so adding a new style never needs a migration.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blouse_designs_allowed_variations_shape'
  ) THEN
    ALTER TABLE blouse_designs
      ADD CONSTRAINT blouse_designs_allowed_variations_shape CHECK (
        allowed_variations IS NULL
        OR (
          jsonb_typeof(allowed_variations) = 'object'
          AND allowed_variations - 'sleeves' - 'necklines' - 'backs' = '{}'::jsonb
          AND (NOT allowed_variations ? 'sleeves'
               OR jsonb_typeof(allowed_variations -> 'sleeves') = 'array')
          AND (NOT allowed_variations ? 'necklines'
               OR jsonb_typeof(allowed_variations -> 'necklines') = 'array')
          AND (NOT allowed_variations ? 'backs'
               OR jsonb_typeof(allowed_variations -> 'backs') = 'array')
        )
      );
  END IF;
END $$;
