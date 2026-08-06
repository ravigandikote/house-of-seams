-- House of Seams: The Design Story portal
-- Run this in Supabase SQL Editor AFTER 003_full_blouse_measurements.sql.
--
-- Adds a private shareable "design journal" page per request:
--   * atelier_token — unguessable token that IS the page's auth
--     (RLS stays closed; the page reads via the service-role client)
--   * designer_note — Kavya's headline note to the client
--   * request_status_events — the journal timeline; one row per status
--     change. Events are inserted by the app (submit route + admin status
--     update), NOT by a trigger, so the admin's optional client-visible
--     note travels in the same insert as the status change.
--   * status flow extended with 'in_stitching' and 'ready'
--     (submitted → reviewed → quoted → confirmed → in_stitching → ready,
--      cancelled at any point) — keep in sync with REQUEST_STATUSES in
--     src/types/customDesignRequest.ts.

-- gen_random_bytes lives in pgcrypto (gen_random_uuid alone does not need it)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- CUSTOM_DESIGN_REQUESTS: token, designer note, wider status flow
-- ============================================================

ALTER TABLE custom_design_requests
  ADD COLUMN IF NOT EXISTS atelier_token TEXT UNIQUE NOT NULL
    DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS designer_note TEXT;

-- Widen the status CHECK (constraint was auto-named from the inline
-- column CHECK in 002).
ALTER TABLE custom_design_requests
  DROP CONSTRAINT IF EXISTS custom_design_requests_status_check;
ALTER TABLE custom_design_requests
  ADD CONSTRAINT custom_design_requests_status_check
  CHECK (status IN ('submitted', 'reviewed', 'quoted', 'confirmed', 'in_stitching', 'ready', 'cancelled'));

-- ============================================================
-- REQUEST_STATUS_EVENTS (service-role only — the journal timeline)
-- ============================================================

CREATE TABLE IF NOT EXISTS request_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES custom_design_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'reviewed', 'quoted', 'confirmed', 'in_stitching', 'ready', 'cancelled')),
  -- Client-visible message shown on the atelier page for this chapter
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on, NO policies: readable/writable only via the service-role client.
-- The atelier page authenticates by unguessable token server-side.
ALTER TABLE request_status_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_request_status_events_request_id
  ON request_status_events(request_id, created_at);

-- ============================================================
-- BACKFILL: one 'submitted' chapter per existing request
-- ============================================================

INSERT INTO request_status_events (request_id, status, created_at)
SELECT r.id, 'submitted', r.created_at
FROM custom_design_requests r
WHERE NOT EXISTS (
  SELECT 1 FROM request_status_events e
  WHERE e.request_id = r.id AND e.status = 'submitted'
);
