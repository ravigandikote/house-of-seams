import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const body = await request.json();
  const snakeBody = toSnakeCase(body) as Record<string, unknown>;
  delete snakeBody.id;
  const { data, error } = await supabase.from('gallery').update(snakeBody).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('gallery').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
