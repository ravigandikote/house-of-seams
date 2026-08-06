import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';
import { upsertCustomer } from '@/lib/customers';
import {
    APPOINTMENT_SERVICES,
    APPOINTMENT_SLOTS,
    VISIT_TYPES,
    VisitType,
} from '@/config/appointmentPolicy';

// Public endpoint: guests can book an appointment (same public-insert
// policy as the bookings table has always had). Also registers the
// customer in the customer database. The session user (if any) is
// attached server-side.

interface BookingSubmission {
    customerName?: string;
    email?: string | null;
    phone?: string | null;
    date?: string;
    time?: string;
    service?: string;
    visitType?: VisitType;
    notes?: string | null;
    policyAccepted?: boolean;
    requestReference?: string | null;
}

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as BookingSubmission;

  if (!body.customerName?.trim()) return validationError('Name is required');
  if (!body.email?.trim() && !body.phone?.trim()) {
    return validationError('An email or phone number is required so we can confirm your appointment');
  }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return validationError('Please pick a date');
  const today = new Date().toISOString().slice(0, 10);
  if (body.date < today) return validationError('Please pick a date in the future');
  if (!body.time || !(APPOINTMENT_SLOTS as readonly string[]).includes(body.time)) {
    return validationError('Please pick a time slot');
  }
  if (!body.service || !(APPOINTMENT_SERVICES as readonly string[]).includes(body.service)) {
    return validationError('Please pick a service');
  }
  if (!body.visitType || !VISIT_TYPES.includes(body.visitType)) {
    return validationError('Please choose an in-person or virtual visit');
  }
  if (!body.policyAccepted) {
    return validationError('Please accept the appointment policy to book');
  }
  if (body.notes && body.notes.length > 2000) return validationError('Notes are too long');

  // Optional design-request reference from the customize/atelier bridge —
  // sanitised to its display shape; anything else is silently dropped.
  const refRaw = body.requestReference?.trim().toUpperCase() ?? '';
  const requestReference = /^[A-Z0-9]{4,12}$/.test(refRaw) ? refRaw : null;

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  const { data, error } = await admin
    .from('bookings')
    .insert({
      customer_name: body.customerName.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      date: body.date,
      time: body.time,
      service: body.service,
      visit_type: body.visitType,
      request_reference: requestReference,
      notes: body.notes?.trim() || null,
      policy_accepted_at: new Date().toISOString(),
      status: 'pending',
      user_id: userId,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await upsertCustomer(admin, {
    name: body.customerName,
    email: body.email,
    phone: body.phone,
    source: 'booking',
    userId,
  });

  return NextResponse.json(toCamelCase(data), { status: 201 });
}
