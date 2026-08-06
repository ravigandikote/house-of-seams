import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import { validateStyleAttributes } from '@/lib/garmentStyles';
import { GarmentDesign } from '@/types/garmentDesign';

// Never serve admin data from the route-handler static cache: Next 14
// caches parameterless GET handlers (in dev AND at build time), which
// froze list responses. Admin reads must always hit the database.
export const dynamic = 'force-dynamic';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

// ONE designs resource for every garment_designs-backed category; the
// admin Designs page filters by category client-side. styleAttributes
// are validated against the owning category's manifest enums.

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase
    .from('garment_designs')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const body = (await request.json()) as Partial<GarmentDesign>;

  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const validated = validateStyleAttributes(String(body.category ?? ''), body.styleAttributes);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });

  const row = toSnakeCase({
    category: body.category,
    name: body.name.trim(),
    slug: body.slug?.trim() || slugify(body.name),
    description: body.description?.trim() || null,
    styleAttributes: validated.attributes,
    isSignature: !!body.isSignature,
    designerNote: body.designerNote?.trim() || null,
    sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
    isActive: body.isActive !== false,
  }) as Record<string, unknown>;

  const { data, error } = await supabase.from('garment_designs').insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
