import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';
import { BOOKING_STATUSES, BookingStatus } from '@/types/booking';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

// The booking details are the customer's submission — only the status is
// admin-editable; delete exists for data hygiene.

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as { status?: BookingStatus };
  if (!body.status || !BOOKING_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${BOOKING_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: body.status })
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { error } = await supabase.from('bookings').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
