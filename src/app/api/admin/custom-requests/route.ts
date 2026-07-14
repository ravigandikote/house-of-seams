import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';

// TODO(security): /api/admin/* routes have NO authentication and use the
// service-role client (bypasses RLS). This route inherits that existing
// gap — add an admin auth check here when /admin is protected.

// Requests are created by customers via /api/customize/submit — this
// admin resource is list-only (plus status updates via [id]).

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase
    .from('custom_design_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}
