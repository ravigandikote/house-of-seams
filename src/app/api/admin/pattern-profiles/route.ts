import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import { validatePatternProfile } from '@/lib/patternValidation';
import { PatternProfile } from '@/types/pattern';

// Never serve admin data from the route-handler static cache: Next 14
// caches parameterless GET handlers (in dev AND at build time), which
// froze list responses. Admin reads must always hit the database.
export const dynamic = 'force-dynamic';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler). This route
// uses the service-role client, which bypasses RLS.

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase
    .from('pattern_profiles')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const body = (await request.json()) as Partial<PatternProfile>;
  const problem = validatePatternProfile(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const row = toSnakeCase({
    shopifyHandle: body.shopifyHandle!.trim(),
    title: body.title!.trim(),
    category: body.category,
    patternType: body.patternType!.trim(),
    difficulty: body.difficulty,
    sizeRange: body.sizeRange!.trim(),
    formats: body.formats,
    fabricNotes: body.fabricNotes?.trim() || null,
    whatsIncluded: body.whatsIncluded ?? [],
    previewConfig: body.previewConfig,
    relatedDesignSlugs: body.relatedDesignSlugs ?? [],
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
  }) as Record<string, unknown>;

  const { data, error } = await supabase.from('pattern_profiles').insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
