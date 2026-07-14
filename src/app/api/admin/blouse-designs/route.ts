import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';

// TODO(security): /api/admin/* routes have NO authentication and use the
// service-role client (bypasses RLS). This route inherits that existing
// gap — add an admin auth check here when /admin is protected.

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await supabase.from('blouse_designs').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const body = await request.json();
  const snakeBody = toSnakeCase(body) as Record<string, unknown>;
  delete snakeBody.id;
  const { data, error } = await supabase.from('blouse_designs').insert(snakeBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
