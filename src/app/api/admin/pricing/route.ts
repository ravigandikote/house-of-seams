import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('pricing').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const snakeBody = toSnakeCase(body) as Record<string, unknown>;
  delete snakeBody.id;
  const { data, error } = await supabase.from('pricing').insert(snakeBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
