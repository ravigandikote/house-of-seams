-- House of Seams: Appointment policy fields + customer database
-- Run this in Supabase SQL Editor AFTER 003 (order vs 005 doesn't matter —
-- they touch different tables).

-- ============================================================
-- BOOKINGS: appointment-policy fields + customizer bridge
-- ============================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS visit_type TEXT CHECK (visit_type IN ('in-person', 'virtual')),
  ADD COLUMN IF NOT EXISTS policy_accepted_at TIMESTAMPTZ,
  -- Display reference (e.g. "295ADC72") of the custom design request a
  -- consultation was booked about, carried from the customize/atelier CTA.
  ADD COLUMN IF NOT EXISTS request_reference TEXT;

-- ============================================================
-- CUSTOMERS: lightweight customer database (email + phone signup)
-- ============================================================
-- Populated automatically from every touchpoint (bookings, custom design
-- requests, newsletter signups) via the service-role API routes.
-- No public read/write policies: RLS is enabled with no policies, so only
-- the service-role client (admin panel + server routes) can access it.

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  -- where we first met this customer: booking | custom-design | newsletter
  source TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  marketing_opt_in BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- (no policies on purpose — service-role access only)

-- One row per email; phone lookups indexed for phone-only signups.
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_unique ON customers (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers (created_at DESC);
