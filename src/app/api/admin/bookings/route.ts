import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';

// Never serve admin data from the route-handler static cache: Next 14
// caches parameterless GET handlers (in dev AND at build time), which
// froze list responses. Admin reads must always hit the database.
export const dynamic = 'force-dynamic';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

// Bookings are created by customers via /api/booking/submit (and as
// companions to custom design requests) — this admin resource is
// list-only, plus status updates and delete via [id].

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}
