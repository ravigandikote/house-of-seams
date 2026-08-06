import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';
import { AdminRequestUpdate, REQUEST_STATUSES } from '@/types/customDesignRequest';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

// The design and measurements are the customer's submission and stay
// immutable. The admin may change the status (which writes a Design Story
// chapter, optionally carrying a client-visible message) and the
// designer_note headline shown on the atelier page.

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as AdminRequestUpdate;
  if (body.status !== undefined && !REQUEST_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${REQUEST_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }
  if (body.status === undefined && body.designerNote === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  // Read the current status first so a re-save of the same status doesn't
  // write a duplicate chapter to the Design Story timeline.
  const { data: existing, error: fetchError } = await supabase
    .from('custom_design_requests')
    .select('id, status')
    .eq('id', params.id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json(
      { error: fetchError?.message || 'Request not found' },
      { status: fetchError?.code === 'PGRST116' ? 404 : 500 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.designerNote !== undefined) updates.designer_note = body.designerNote?.trim() || null;

  const { data, error } = await supabase
    .from('custom_design_requests')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });

  // New chapter on a real status change; the optional message travels on
  // the event, not the request. Best-effort — the update itself succeeded.
  if (body.status !== undefined && body.status !== existing.status) {
    await supabase.from('request_status_events').insert({
      request_id: params.id,
      status: body.status,
      note: body.statusNote?.trim() || null,
    });
  }

  return NextResponse.json(toCamelCase(data));
}
