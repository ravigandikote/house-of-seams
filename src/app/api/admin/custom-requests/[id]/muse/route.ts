import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Never serve admin data from the route-handler static cache (Next 14
// caches parameterless GET handlers) — and signed URLs must be minted
// fresh on every request anyway.
export const dynamic = 'force-dynamic';

// Auth: /api/admin/* is gated by the ADMIN_EMAILS allowlist in
// src/middleware.ts (401/403 before reaching this handler).

// Signed URLs for a request's Muse Board images (private bucket) — the
// admin detail modal fetches these on open.

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: req, error } = await supabase
    .from('custom_design_requests')
    .select('muse_board')
    .eq('id', params.id)
    .maybeSingle();
  if (error || !req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  const board = (req.muse_board ?? {}) as { image_paths?: string[]; occasion_note?: string | null };
  const paths = board.image_paths ?? [];
  let urls: string[] = [];
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('muse-boards')
      .createSignedUrls(paths, 60 * 60);
    urls = (signed ?? []).filter((s) => s.signedUrl && !s.error).map((s) => s.signedUrl);
  }
  return NextResponse.json({ urls, occasionNote: board.occasion_note ?? null });
}
