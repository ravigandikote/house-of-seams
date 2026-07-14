import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';
import { REQUEST_STATUSES, RequestStatus } from '@/types/customDesignRequest';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

// Only the status can be updated from the admin panel — the design and
// measurements are the customer's submission and stay immutable.

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as { status?: RequestStatus };
  if (!body.status || !REQUEST_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${REQUEST_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase
    .from('custom_design_requests')
    .update({ status: body.status })
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  return NextResponse.json(toCamelCase(data));
}
