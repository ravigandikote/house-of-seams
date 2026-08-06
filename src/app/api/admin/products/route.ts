import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';

// Never serve admin data from the route-handler static cache: Next 14
// caches parameterless GET handlers (in dev AND at build time), which
// froze list responses. Admin reads must always hit the database.
export const dynamic = 'force-dynamic';


export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const snakeBody = toSnakeCase(body) as Record<string, unknown>;
  delete snakeBody.id;
  if (snakeBody.name && !snakeBody.slug) {
    snakeBody.slug = (snakeBody.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const { data, error } = await supabase.from('products').insert(snakeBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
