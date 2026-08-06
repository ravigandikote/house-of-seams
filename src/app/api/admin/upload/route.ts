import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

// Never serve admin data from the route-handler static cache: Next 14
// caches parameterless GET handlers (in dev AND at build time), which
// froze list responses. Admin reads must always hit the database.
export const dynamic = 'force-dynamic';

// Admin media uploads → Supabase Storage `media` bucket (public read).
// Replaces the old public/images/uploads filesystem writes, which never
// persisted on Vercel. Response contract unchanged: { url } on 201.
// Object keys are generated server-side — the client filename is never
// trusted or used.

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB — also enforced by the bucket itself

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const key = `${Date.now()}-${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from('media')
    .upload(key, bytes, { contentType: file.type, cacheControl: '31536000' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from('media').getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
