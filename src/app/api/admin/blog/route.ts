import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('blog_posts').select('*').order('published_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data));
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const snakeBody = toSnakeCase(body) as Record<string, unknown>;
  delete snakeBody.id;
  if (snakeBody.title && !snakeBody.slug) {
    snakeBody.slug = (snakeBody.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const { data, error } = await supabase.from('blog_posts').insert(snakeBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toCamelCase(data), { status: 201 });
}
