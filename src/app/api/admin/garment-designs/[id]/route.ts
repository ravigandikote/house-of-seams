import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import { validateStyleAttributes } from '@/lib/garmentStyles';
import { GarmentDesign } from '@/types/garmentDesign';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const body = (await request.json()) as Partial<GarmentDesign>;

  // The category is immutable on update — styles validate against the
  // stored row's category, never a client-sent one.
  const { data: existing, error: fetchError } = await supabase
    .from('garment_designs')
    .select('category')
    .eq('id', params.id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Design not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) {
    if (!body.name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    updates.name = body.name.trim();
  }
  if (body.slug !== undefined && body.slug.trim()) updates.slug = body.slug.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.styleAttributes !== undefined) {
    const validated = validateStyleAttributes(existing.category, body.styleAttributes);
    if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
    updates.styleAttributes = validated.attributes;
  }
  if (body.isSignature !== undefined) updates.isSignature = !!body.isSignature;
  if (body.designerNote !== undefined) updates.designerNote = body.designerNote?.trim() || null;
  if (body.sortOrder !== undefined && Number.isFinite(body.sortOrder)) updates.sortOrder = body.sortOrder;
  if (body.isActive !== undefined) updates.isActive = !!body.isActive;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('garment_designs')
    .update(toSnakeCase(updates) as Record<string, unknown>)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { error } = await supabase.from('garment_designs').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
