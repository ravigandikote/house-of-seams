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
    LehengaDesignSnapshot,
    RequestCategory,
    RequestPreferences,
    SalwarSuitSnapshot,
    SEAM_ALLOWANCES,
    isBlousePreferences,
} from '@/types/customDesignRequest';
import { MEASUREMENT_FIELDS, MEASUREMENT_LABELS, MEASUREMENT_RANGES } from '@/types/measurements';
import { BACK_STYLES, CLOSURES, EMBELLISHMENTS, NECK_STYLES, SLEEVE_STYLES } from '@/types/blouseDesign';
import { LEHENGA_CLOSURES, LEHENGA_EMBELLISHMENTS, LEHENGA_SILHOUETTES } from '@/types/lehengaDesign';
import { LEHENGA_MEASUREMENT_SPEC } from '@/types/lehengaMeasurements';
import { categoryById } from '@/types/customizerCategories';
import { StyleAttributes, effectiveField } from '@/types/measurementSpec';
import { KURTI_CUTS, KURTI_NECKLINES, KURTI_SLITS } from '@/types/kurtiDesign';
import { BOTTOM_PLEATS, BOTTOM_STYLES, WAISTBANDS } from '@/types/bottomsDesign';
import { SALWAR_SUIT_MEASUREMENT_SPEC } from '@/types/salwarSuitMeasurements';

// Public endpoint: guests can submit a custom design request (same
// public-insert policy as bookings). Category-aware: blouse requests are
// validated against the 23-field standard chart + preferences; lehenga
// requests against LEHENGA_MEASUREMENT_SPEC (honouring visibleWhen — a
// straight lehenga is never asked for a knee round). Writes use the
// service-role client; the logged-in user (if any) is attached
// server-side — the client-sent userId is never trusted.

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CustomDesignRequestInput & { category?: RequestCategory };
  const category: RequestCategory = body.category ?? 'blouse';
  const manifest = categoryById(category);
  // Only categories the manifest declares open can submit — the DB CHECK
  // pre-registers future slugs, but the app is the gatekeeper.
  if (!manifest?.available || !manifest.spec) {
    return validationError('This category is not open for orders yet');
  }

  // --- Shared validation ---
  if (!body.customerName?.trim()) return validationError('Name is required');
  if (!body.customerEmail?.trim() && !body.customerPhone?.trim()) {
    return validationError('An email or phone number is required so we can reach you');
  }
  if (!body.designSnapshot?.name) return validationError('No design selected');

  // --- Category validation: measurements + preferences ---
  let measurements: Record<string, number>;
  let preferences: RequestPreferences | null = null;

  if (category === 'blouse') {
    for (const field of MEASUREMENT_FIELDS) {
      const value = body.measurements?.[field];
      const { min, max } = MEASUREMENT_RANGES[field];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        return validationError(`${MEASUREMENT_LABELS[field]} must be between ${min} and ${max} inches`);
      }
    }
    measurements = body.measurements;

    // Additional details: normalise and validate against the allowed values.
    const rawPrefs = body.preferences ?? DEFAULT_PREFERENCES;
    if (!isBlousePreferences(rawPrefs)) return validationError('Invalid preferences');
    const raw = rawPrefs;
    if (!BLOUSE_OPENINGS.includes(raw.blouseOpening)) return validationError('Invalid blouse opening');
    if (!FIT_PREFERENCES.includes(raw.fitPreference)) return validationError('Invalid fit preference');
    if (!SEAM_ALLOWANCES.includes(raw.seamAllowance)) return validationError('Invalid seam allowance');
    if (raw.braSize && raw.braSize.length > 20) return validationError('Inner-wear size is too long');
    preferences = {
      braSize: raw.braSize?.trim() || null,
      blouseOpening: raw.blouseOpening,
      cupPadding: !!raw.cupPadding,
      fitPreference: raw.fitPreference,
      seamAllowance: raw.seamAllowance,
    };
  } else if (category === 'lehenga') {
    const snapshot = body.designSnapshot as LehengaDesignSnapshot;
    if (!LEHENGA_SILHOUETTES.includes(snapshot.silhouette)) return validationError('Invalid silhouette');
    if (!LEHENGA_CLOSURES.includes(snapshot.closure)) return validationError('Invalid closure');
    if (!LEHENGA_EMBELLISHMENTS.includes(snapshot.embellishment)) return validationError('Invalid embellishment');

    // Only fields visible for this silhouette are required/stored.
    const styleAttrs = { silhouette: snapshot.silhouette };
    measurements = {};
    const raw = (body.measurements ?? {}) as Record<string, unknown>;
    for (const field of LEHENGA_MEASUREMENT_SPEC.fields) {
      if (field.visibleWhen && !field.visibleWhen(styleAttrs)) continue;
      const value = raw[field.key];
      if (value == null && field.optional) continue;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < field.min || value > field.max) {
        return validationError(
          `${field.label} must be between ${field.min} and ${field.max}${field.unit === 'in' ? ' inches' : ''}`
        );
      }
      measurements[field.key] = value;
    }

    // The choli is optional ("skirt only" is first-class); when present it
    // IS a blouse — same enums, same 23-field measurement chart.
    const choli = snapshot.choli ?? null;
    if (choli) {
      if (!choli.name) return validationError('The choli design is missing its name');
      if (!NECK_STYLES.includes(choli.neckStyle)) return validationError('Invalid choli neck style');
      if (!BACK_STYLES.includes(choli.backStyle)) return validationError('Invalid choli back style');
      if (!SLEEVE_STYLES.includes(choli.sleeveStyle)) return validationError('Invalid choli sleeve style');
      if (!CLOSURES.includes(choli.closure)) return validationError('Invalid choli closure');
      if (!EMBELLISHMENTS.includes(choli.embellishment)) return validationError('Invalid choli embellishment');
      for (const field of MEASUREMENT_FIELDS) {
        const value = raw[field];
        const { min, max } = MEASUREMENT_RANGES[field];
        if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
          return validationError(
            `Choli ${MEASUREMENT_LABELS[field]} must be between ${min} and ${max} inches`
          );
        }
        measurements[field] = value;
      }
    }

    // Lehenga preferences carry only the dupatta choice.
    const rawPrefs = (body.preferences ?? {}) as Record<string, unknown>;
    preferences = { dupatta: rawPrefs.dupatta === true };
  } else if (category === 'salwar_suit') {
    // A suit = kameez (kurti attrs) + bottoms; both garments validate
    // against their own enums, then ONE combined chart (shared body
    // fields deduped by the suit spec) with merged style attrs driving
    // visibleWhen and per-style ranges.
    const snapshot = body.designSnapshot as SalwarSuitSnapshot;
    if (!KURTI_CUTS.includes(snapshot.cut)) return validationError('Invalid kameez cut');
    if (!KURTI_SLITS.includes(snapshot.slit)) return validationError('Invalid kameez slit');
    if (!KURTI_NECKLINES.includes(snapshot.neckline)) return validationError('Invalid kameez neckline');
    if (!SLEEVE_STYLES.includes(snapshot.sleeveStyle)) return validationError('Invalid kameez sleeves');
    if (!EMBELLISHMENTS.includes(snapshot.embellishment)) return validationError('Invalid kameez embellishment');
    const suitBottoms = snapshot.bottoms;
    if (!suitBottoms?.name) return validationError('The suit is missing its bottoms');
    if (!BOTTOM_STYLES.includes(suitBottoms.bottomStyle)) return validationError('Invalid bottom style');
    if (!WAISTBANDS.includes(suitBottoms.waistband)) return validationError('Invalid waistband');
    if (!BOTTOM_PLEATS.includes(suitBottoms.pleats)) return validationError('Invalid pleats');

    const styleAttrs: StyleAttributes = {
      cut: snapshot.cut,
      slit: snapshot.slit,
      neckline: snapshot.neckline,
      sleeveStyle: snapshot.sleeveStyle,
      embellishment: snapshot.embellishment,
      bottomStyle: suitBottoms.bottomStyle,
      waistband: suitBottoms.waistband,
      pleats: suitBottoms.pleats,
    };
    measurements = {};
    const raw = (body.measurements ?? {}) as Record<string, unknown>;
    for (const field of SALWAR_SUIT_MEASUREMENT_SPEC.fields) {
      if (field.visibleWhen && !field.visibleWhen(styleAttrs)) continue;
      const eff = effectiveField(field, styleAttrs);
      const value = raw[field.key];
      if (value == null && field.optional) continue;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < eff.min || value > eff.max) {
        return validationError(
          `${eff.label} must be between ${eff.min} and ${eff.max}${eff.unit === 'in' ? ' inches' : ''}`
        );
      }
      measurements[field.key] = value;
    }
    const rawPrefs = (body.preferences ?? {}) as Record<string, unknown>;
    preferences = { dupatta: rawPrefs.dupatta === true };
  } else {
    // Generic manifest-driven categories (kurti today; more tomorrow):
    // style attrs validate against the manifest enums, measurements
    // against the spec honouring visibleWhen AND per-style ranges.
    if (!manifest.styleEnums) return validationError('This category is not open for orders yet');
    const snapshot = body.designSnapshot as unknown as Record<string, string>;
    const styleAttrs: StyleAttributes = {};
    for (const [key, allowed] of Object.entries(manifest.styleEnums)) {
      const value = snapshot[key];
      if (typeof value !== 'string' || !allowed.includes(value)) {
        return validationError(`${key} must be one of: ${allowed.join(', ')}`);
      }
      styleAttrs[key] = value;
    }

    measurements = {};
    const raw = (body.measurements ?? {}) as Record<string, unknown>;
    for (const field of manifest.spec.fields) {
      if (field.visibleWhen && !field.visibleWhen(styleAttrs)) continue;
      const eff = effectiveField(field, styleAttrs);
      const value = raw[field.key];
      if (value == null && field.optional) continue;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < eff.min || value > eff.max) {
        return validationError(
          `${eff.label} must be between ${eff.min} and ${eff.max}${eff.unit === 'in' ? ' inches' : ''}`
        );
      }
      measurements[field.key] = value;
    }
    preferences = null;
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  // Attach the session user server-side (guests submit with user_id null).
  const supabase = createClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  const requestRow = toSnakeCase({
    userId,
    category,
    designId: body.designId ?? null,
    designSnapshot: body.designSnapshot,
    measurements,
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
  // request itself. Keep the note scannable: key facts only — the full
  // measurement set lives on the request in Admin > Custom Requests.
  let summary: string;
  let service: string;
  if (category === 'blouse') {
    const snapshot = body.designSnapshot as CustomDesignRequestInput['designSnapshot'] & {
      neckStyle: string; sleeveStyle: string; embellishment: string; baseColor: string;
    };
    const CORE_FIELDS = ['bust', 'waist', 'shoulderWidth', 'blouseLength', 'sleeveLength'] as const;
    const blousePrefs = preferences as BlousePreferences;
    service = 'Custom Blouse Design';
    summary =
      `Custom blouse request: ${snapshot.name} — ` +
      `${snapshot.neckStyle} neck, ${snapshot.sleeveStyle} sleeves, ` +
      `${snapshot.embellishment}, color ${body.selectedColor ?? snapshot.baseColor}, ` +
      `${blousePrefs.blouseOpening} opening, ${blousePrefs.fitPreference} fit. ` +
      CORE_FIELDS.map((f) => `${MEASUREMENT_LABELS[f]} ${measurements[f]}"`).join(', ') +
      (body.notes?.trim() ? `. Notes: ${body.notes.trim()}` : '') +
      '. Full measurements in Admin > Custom Requests.';
  } else if (category === 'lehenga') {
    const snapshot = body.designSnapshot as LehengaDesignSnapshot;
    const withDupatta = preferences !== null && !isBlousePreferences(preferences) && preferences.dupatta;
    service = 'Custom Lehenga Design';
    summary =
      `Custom lehenga request: ${snapshot.name} — ` +
      `${snapshot.silhouette.replace(/_/g, ' ')} silhouette, ${snapshot.embellishment}, ` +
      `color ${body.selectedColor ?? snapshot.baseColor}` +
      (snapshot.choli ? ` + ${snapshot.choli.name} choli (${snapshot.choli.neckStyle} neck)` : ', skirt only') +
      (withDupatta ? ', with dupatta' : '') +
      `. Waist ${measurements.waistRound}", hip ${measurements.hipRound}", ` +
      `length ${measurements.lehengaLength}", ghera ${measurements.flareGhera}"` +
      (snapshot.choli ? `, bust ${measurements.bust}"` : '') +
      (body.notes?.trim() ? `. Notes: ${body.notes.trim()}` : '') +
      '. Full measurements in Admin > Custom Requests.';
  } else if (category === 'salwar_suit') {
    const snapshot = body.designSnapshot as SalwarSuitSnapshot;
    const withDupatta = preferences !== null && !isBlousePreferences(preferences) && preferences.dupatta;
    service = 'Custom Salwar Suit';
    summary =
      `Custom salwar suit request: ${snapshot.name} kameez (${snapshot.cut.replace(/_/g, ' ')} cut, ` +
      `${snapshot.neckline} neck) + ${snapshot.bottoms.name} ` +
      `(${snapshot.bottoms.bottomStyle.replace(/_/g, ' ')})` +
      (withDupatta ? ', with dupatta' : '') +
      `. Bust ${measurements.bust}", waist ${measurements.waistRound}", ` +
      `kameez length ${measurements.kurtiLength}", bottom length ${measurements.bottomLength}"` +
      (body.notes?.trim() ? `. Notes: ${body.notes.trim()}` : '') +
      '. Full measurements in Admin > Custom Requests.';
  } else {
    // Generic manifest categories: name + style values + leading numbers.
    const snapshot = body.designSnapshot as unknown as Record<string, string>;
    const styleBits = Object.keys(manifest.styleEnums ?? {})
      .map((k) => snapshot[k]?.replace(/_/g, ' '))
      .filter(Boolean)
      .join(', ');
    const numberBits = manifest.spec.fields
      .slice(0, 4)
      .filter((f) => typeof measurements[f.key] === 'number')
      .map((f) => `${f.label} ${measurements[f.key]}${f.unit === 'in' ? '"' : ''}`)
      .join(', ');
    service = `Custom ${manifest.label} Design`;
    summary =
      `Custom ${manifest.label.toLowerCase()} request: ${snapshot.name} — ${styleBits}, ` +
      `color ${body.selectedColor ?? snapshot.baseColor}. ${numberBits}` +
      (body.notes?.trim() ? `. Notes: ${body.notes.trim()}` : '') +
      '. Full measurements in Admin > Custom Requests.';
  }

  let linkedBookingId: string | null = null;
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      customer_name: body.customerName.trim(),
      email: body.customerEmail?.trim() || null,
      phone: body.customerPhone?.trim() || null,
      service,
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
