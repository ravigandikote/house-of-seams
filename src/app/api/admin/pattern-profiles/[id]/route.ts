import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import { validatePatternProfile } from '@/lib/patternValidation';
import { PatternProfile } from '@/types/pattern';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler).

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const body = (await request.json()) as Partial<PatternProfile>;
  const problem = validatePatternProfile(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const updates = toSnakeCase({
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

  const { data, error } = await supabase
    .from('pattern_profiles')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { error } = await supabase.from('pattern_profiles').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
