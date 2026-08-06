import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import { upsertCustomer } from '@/lib/customers';
import {
    BLOUSE_OPENINGS,
    BlousePreferences,
    CustomDesignRequestInput,
    DEFAULT_PREFERENCES,
    FIT_PREFERENCES,
    SEAM_ALLOWANCES,
} from '@/types/customDesignRequest';
import { MEASUREMENT_FIELDS, MEASUREMENT_LABELS, MEASUREMENT_RANGES } from '@/types/measurements';

// Public endpoint: guests can submit a custom design request (same
// public-insert policy as bookings). Writes use the service-role client;
// the logged-in user (if any) is attached server-side from the session —
// the client-sent userId is never trusted.

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CustomDesignRequestInput;

  // --- Server-side validation ---
  if (!body.customerName?.trim()) return validationError('Name is required');
  if (!body.customerEmail?.trim() && !body.customerPhone?.trim()) {
    return validationError('An email or phone number is required so we can reach you');
  }
  if (!body.designSnapshot?.name) return validationError('No design selected');
  for (const field of MEASUREMENT_FIELDS) {
    const value = body.measurements?.[field];
    const { min, max } = MEASUREMENT_RANGES[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      return validationError(`${MEASUREMENT_LABELS[field]} must be between ${min} and ${max} inches`);
    }
  }

  // Additional details: normalise and validate against the allowed values.
  const raw = body.preferences ?? DEFAULT_PREFERENCES;
  if (!BLOUSE_OPENINGS.includes(raw.blouseOpening)) return validationError('Invalid blouse opening');
  if (!FIT_PREFERENCES.includes(raw.fitPreference)) return validationError('Invalid fit preference');
  if (!SEAM_ALLOWANCES.includes(raw.seamAllowance)) return validationError('Invalid seam allowance');
  if (raw.braSize && raw.braSize.length > 20) return validationError('Inner-wear size is too long');
  const preferences: BlousePreferences = {
    braSize: raw.braSize?.trim() || null,
    blouseOpening: raw.blouseOpening,
    cupPadding: !!raw.cupPadding,
    fitPreference: raw.fitPreference,
    seamAllowance: raw.seamAllowance,
  };

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  // Attach the session user server-side (guests submit with user_id null).
  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  const requestRow = toSnakeCase({
    userId,
    designId: body.designId ?? null,
    designSnapshot: body.designSnapshot,
    measurements: body.measurements,
    selectedColor: body.selectedColor ?? null,
    customerAge: body.customerAge ?? null,
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail?.trim() || null,
    customerPhone: body.customerPhone?.trim() || null,
    notes: body.notes?.trim() || null,
    preferences,
    status: 'submitted',
  }) as Record<string, unknown>;

  const { data: created, error } = await admin
    .from('custom_design_requests')
    .insert(requestRow)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Register the customer in the boutique's customer database (best-effort).
  await upsertCustomer(admin, {
    name: body.customerName,
    email: body.customerEmail,
    phone: body.customerPhone,
    source: 'custom-design',
    userId,
  });

  // Opening chapter of the request's Design Story timeline (see
  // 005_design_story.sql — events are app-inserted, not triggered).
  // Best-effort: a failed event must never fail the request.
  await admin
    .from('request_status_events')
    .insert({ request_id: created.id, status: 'submitted' });

  // Best-effort companion booking so the request is immediately visible in
  // the existing admin Bookings view. A failure here must not fail the
  // request itself.
  // Keep the booking note scannable: key facts only — the full 23
  // measurements + preferences live on the request in Admin > Custom Requests.
  const CORE_FIELDS = ['bust', 'waist', 'shoulderWidth', 'blouseLength', 'sleeveLength'] as const;
  const summary =
    `Custom blouse request: ${body.designSnapshot.name} — ` +
    `${body.designSnapshot.neckStyle} neck, ${body.designSnapshot.sleeveStyle} sleeves, ` +
    `${body.designSnapshot.embellishment}, color ${body.selectedColor ?? body.designSnapshot.baseColor}, ` +
    `${preferences.blouseOpening} opening, ${preferences.fitPreference} fit. ` +
    CORE_FIELDS.map((f) => `${MEASUREMENT_LABELS[f]} ${body.measurements[f]}"`).join(', ') +
    (body.notes?.trim() ? `. Notes: ${body.notes.trim()}` : '') +
    '. Full measurements in Admin > Custom Requests.';

  let linkedBookingId: string | null = null;
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      customer_name: body.customerName.trim(),
      email: body.customerEmail?.trim() || null,
      phone: body.customerPhone?.trim() || null,
      service: 'Custom Blouse Design',
      notes: summary,
      status: 'pending',
      user_id: userId,
    })
    .select('id')
    .single();
  if (!bookingError && booking) {
    linkedBookingId = booking.id;
    await admin
      .from('custom_design_requests')
      .update({ linked_booking_id: linkedBookingId })
      .eq('id', created.id);
  }

  return NextResponse.json(
    toCamelCase({ ...created, linked_booking_id: linkedBookingId }),
    { status: 201 }
  );
}
