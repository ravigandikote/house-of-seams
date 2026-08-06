import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import {
  AdminRequestUpdate,
  REQUEST_STATUSES,
  SKETCH_VIEWS,
  SketchAnnotation,
} from '@/types/customDesignRequest';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

// The design and measurements are the customer's submission and stay
// immutable. The admin may change: the status (which writes a Design
// Story chapter, optionally carrying a client-visible message), the
// designer_note headline, and the sketch annotations (Kavya's pins).

const MAX_ANNOTATIONS = 40;
const MAX_NOTE_LENGTH = 300;

function validAnnotations(value: unknown): value is SketchAnnotation[] {
  if (!Array.isArray(value) || value.length > MAX_ANNOTATIONS) return false;
  return value.every(
    (a) =>
      a &&
      typeof a.id === 'string' && a.id.length > 0 && a.id.length <= 64 &&
      SKETCH_VIEWS.includes(a.view) &&
      typeof a.xPct === 'number' && Number.isFinite(a.xPct) && a.xPct >= 0 && a.xPct <= 100 &&
      typeof a.yPct === 'number' && Number.isFinite(a.yPct) && a.yPct >= 0 && a.yPct <= 100 &&
      typeof a.note === 'string' && a.note.trim().length > 0 && a.note.length <= MAX_NOTE_LENGTH &&
      typeof a.createdAt === 'string'
  );
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as AdminRequestUpdate;
  if (body.status !== undefined && !REQUEST_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${REQUEST_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }
  if (body.annotations !== undefined && !validAnnotations(body.annotations)) {
    return NextResponse.json(
      { error: `annotations must be an array of up to ${MAX_ANNOTATIONS} pins with non-empty notes` },
      { status: 400 }
    );
  }
  if (body.status === undefined && body.designerNote === undefined && body.annotations === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  // Read current state first: a re-save of the same status must not write
  // a duplicate chapter, and the annotation nudge only fires the FIRST
  // time pins are added.
  const { data: existing, error: fetchError } = await supabase
    .from('custom_design_requests')
    .select('id, status, annotations')
    .eq('id', params.id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json(
      { error: fetchError?.message || 'Request not found' },
      { status: fetchError?.code === 'PGRST116' ? 404 : 500 }
    );
  }

  const statusChanged = body.status !== undefined && body.status !== existing.status;

  // First-annotations nudge: pins added to a request Kavya hasn't moved
  // past 'submitted' yet (and no explicit status change in this save) →
  // the request becomes 'reviewed' with a warm chapter on the journal.
  const hadAnnotations = Array.isArray(existing.annotations) && existing.annotations.length > 0;
  const nudgeToReviewed =
    body.annotations !== undefined &&
    body.annotations.length > 0 &&
    !hadAnnotations &&
    !statusChanged &&
    existing.status === 'submitted';

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.designerNote !== undefined) updates.designer_note = body.designerNote?.trim() || null;
  if (body.annotations !== undefined) {
    // JSONB keys stored snake_case per the repo convention (xPct → x_pct).
    updates.annotations = toSnakeCase(body.annotations);
  }
  if (nudgeToReviewed) updates.status = 'reviewed';

  const { data, error } = await supabase
    .from('custom_design_requests')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });

  // New chapter on a real status change; the optional message travels on
  // the event, not the request. Best-effort — the update itself succeeded.
  if (statusChanged) {
    await supabase.from('request_status_events').insert({
      request_id: params.id,
      status: body.status,
      note: body.statusNote?.trim() || null,
    });
  } else if (nudgeToReviewed) {
    await supabase.from('request_status_events').insert({
      request_id: params.id,
      status: 'reviewed',
      note: 'Kavya has added her thoughts to your design',
    });
  }

  return NextResponse.json(toCamelCase(data));
}
