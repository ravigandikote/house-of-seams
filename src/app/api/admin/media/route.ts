import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Never serve admin data from the route-handler static cache: Next 14
// caches parameterless GET handlers (in dev AND at build time), which
// froze list responses. Admin reads must always hit the database.
export const dynamic = 'force-dynamic';

// Admin media library → Supabase Storage `media` bucket (public read).
// Replaces the old filesystem listing of public/images/uploads. Response
// contract unchanged: [{ filename, url }].

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json([]);
  const { data, error } = await supabase.storage
    .from('media')
    .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const images = (data || [])
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => ({
      filename: f.name,
      url: supabase.storage.from('media').getPublicUrl(f.name).data.publicUrl,
    }));
  return NextResponse.json(images);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  // Keys are flat (no folders) — strip any path segments defensively.
  const safeName = filename.split('/').pop() || '';
  if (!safeName) return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });

  const { error } = await supabase.storage.from('media').remove([safeName]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
