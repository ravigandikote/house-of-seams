import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { MUSE_MAX_IMAGES, MUSE_NOTE_MAX_LENGTH, MuseBoard } from '@/types/customDesignRequest';

// Public endpoint: attach Muse Board inspiration images (and/or the
// occasion note) to a JUST-SUBMITTED custom design request.
//
// Auth = the request's unguessable atelier token, returned by the submit
// endpoint moments earlier. Uploading only after the request exists means
// there are never orphaned objects: every stored image belongs to a real
// request, keyed muse-boards/{requestId}/{uuid}.{ext}. The trade-off (a
// request may end up without its images if this call fails) is handled
// client-side with a gentle retry note on the confirmation screen.

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB — also enforced by the bucket itself

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get('token') ?? '');
  const noteRaw = String(formData.get('occasionNote') ?? '').trim();
  // instanceof Blob, not File: the File global only exists from Node 20,
  // and uploaded form entries are File extends Blob either way.
  const files = formData.getAll('images').filter((f): f is File => f instanceof Blob && f.size > 0);

  if (!/^[0-9a-f]{16,64}$/.test(token)) {
    return NextResponse.json({ error: 'Invalid request token' }, { status: 400 });
  }
  if (files.length === 0 && !noteRaw) {
    return NextResponse.json({ error: 'Nothing to attach' }, { status: 400 });
  }
  if (noteRaw.length > MUSE_NOTE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `The occasion note can be at most ${MUSE_NOTE_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }
  if (files.length > MUSE_MAX_IMAGES) {
    return NextResponse.json(
      { error: `Up to ${MUSE_MAX_IMAGES} inspiration images can be attached` },
      { status: 400 }
    );
  }
  for (const file of files) {
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: 'That image format isn’t supported — JPG, PNG, or WebP please' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Each image can be at most 5MB — a phone photo works perfectly' },
        { status: 400 }
      );
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'The muse board opens once the boutique is fully connected' },
      { status: 503 }
    );
  }

  const { data: req, error: reqError } = await admin
    .from('custom_design_requests')
    .select('id, muse_board')
    .eq('atelier_token', token)
    .maybeSingle();
  if (reqError || !req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  // JSONB keys are stored snake_case per the repo convention.
  const existing = (req.muse_board ?? {}) as { image_paths?: string[]; occasion_note?: string | null };
  const existingPaths = existing.image_paths ?? [];
  if (existingPaths.length + files.length > MUSE_MAX_IMAGES) {
    return NextResponse.json(
      { error: `This design already has ${existingPaths.length} inspiration images — up to ${MUSE_MAX_IMAGES} in total` },
      { status: 400 }
    );
  }

  const newPaths: string[] = [];
  for (const file of files) {
    const key = `${req.id}/${randomUUID()}.${ALLOWED_TYPES[file.type]}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage
      .from('muse-boards')
      .upload(key, bytes, { contentType: file.type });
    if (error) return NextResponse.json({ error: 'Could not save an image — please try again' }, { status: 500 });
    newPaths.push(key);
  }

  const museBoard: MuseBoard = {
    imagePaths: [...existingPaths, ...newPaths],
    occasionNote: noteRaw || existing.occasion_note || null,
  };
  const { error: updateError } = await admin
    .from('custom_design_requests')
    .update({ muse_board: { image_paths: museBoard.imagePaths, occasion_note: museBoard.occasionNote } })
    .eq('id', req.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ imageCount: museBoard.imagePaths.length }, { status: 201 });
}
