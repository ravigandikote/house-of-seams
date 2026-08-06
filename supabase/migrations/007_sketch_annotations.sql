-- House of Seams: "Design With Kavya" sketch annotations
-- Run this in Supabase SQL Editor AFTER 006_muse_board.sql.
--
-- Array of pins Kavya drops on the client's submitted sketch:
--   [{id, view: 'front'|'back', xPct, yPct, note, createdAt}]
-- Coordinates are PERCENTAGES of the rendered SVG box so pins land in
-- the same spot at any resolution, in admin and on the atelier page.

ALTER TABLE custom_design_requests
  ADD COLUMN IF NOT EXISTS annotations JSONB;
