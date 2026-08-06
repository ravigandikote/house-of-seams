import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertCustomer } from '@/lib/customers';

// Public endpoint: lightweight signup with just an email (and optional
// phone/name) — feeds the boutique's customer database.

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { name?: string; email?: string; phone?: string };

  const email = body.email?.trim() || '';
  const phone = body.phone?.trim() || '';
  if (!email && !phone) {
    return NextResponse.json({ error: 'Enter an email or phone number' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }
  if (phone && !/^[0-9+\-() ]{7,15}$/.test(phone)) {
    return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
  }

  const admin = createAdminClient();
  // Demo mode: keep the public footer graceful rather than technical.
  if (!admin) {
    return NextResponse.json(
      { error: 'The mailing list opens soon — please check back.' },
      { status: 503 }
    );
  }

  await upsertCustomer(admin, { name: body.name, email, phone, source: 'newsletter' });
  return NextResponse.json({ success: true }, { status: 201 });
}
