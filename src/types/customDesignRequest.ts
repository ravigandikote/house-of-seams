import { BlouseDesignAttributes } from './blouseDesign';
import { Measurements } from './measurements';

// Matches the CHECK constraint on custom_design_requests.status exactly
// (extended in 005_design_story.sql). Order = the canonical journey;
// cancelled is the exit at any point.
export const REQUEST_STATUSES = [
    'submitted',
    'reviewed',
    'quoted',
    'confirmed',
    'in_stitching',
    'ready',
    'cancelled',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
    submitted: 'Submitted',
    reviewed: 'Reviewed',
    quoted: 'Quoted',
    confirmed: 'Confirmed',
    in_stitching: 'In Stitching',
    ready: 'Ready',
    cancelled: 'Cancelled',
};

// One chapter of a request's Design Story timeline
// (request_status_events — service-role access only).
export interface RequestStatusEvent {
    id: string;
    requestId: string;
    status: RequestStatus;
    // Kavya's client-visible message for this chapter
    note?: string | null;
    createdAt: string;
}

// Fields the admin panel may change on a request; statusNote becomes the
// note on the status event written for the change (never a column).
export interface AdminRequestUpdate {
    status?: RequestStatus;
    statusNote?: string;
    designerNote?: string | null;
}

// "Additional details" from the boutique's standard blouse guide.
// Stored as JSONB in custom_design_requests.preferences.
export const BLOUSE_OPENINGS = ['front', 'back', 'side-zip'] as const;
export type BlouseOpening = (typeof BLOUSE_OPENINGS)[number];

export const FIT_PREFERENCES = ['tight', 'regular', 'comfortable'] as const;
export type FitPreference = (typeof FIT_PREFERENCES)[number];

export const SEAM_ALLOWANCES = ['standard', 'extra'] as const;
export type SeamAllowance = (typeof SEAM_ALLOWANCES)[number];

export interface BlousePreferences {
    braSize?: string | null;
    blouseOpening: BlouseOpening;
    cupPadding: boolean;
    fitPreference: FitPreference;
    // "extra" leaves room in the seams for future alterations
    seamAllowance: SeamAllowance;
}

export const DEFAULT_PREFERENCES: BlousePreferences = {
    braSize: null,
    blouseOpening: 'back',
    cupPadding: false,
    fitPreference: 'regular',
    seamAllowance: 'standard',
};

// Denormalised copy of the chosen design at submit time, so the request
// stays meaningful if the design is later edited or deleted.
export interface DesignSnapshot extends BlouseDesignAttributes {
    name: string;
    slug: string;
}

export interface CustomDesignRequest {
    id: string;
    userId?: string | null;
    designId?: string | null;
    designSnapshot: DesignSnapshot;
    measurements: Measurements;
    selectedColor?: string | null;
    customerAge?: number | null;
    // Contact details support guest submissions (user_id nullable),
    // mirroring how bookings capture contact info.
    customerName: string;
    customerEmail?: string | null;
    customerPhone?: string | null;
    notes?: string | null;
    preferences?: BlousePreferences | null;
    status: RequestStatus;
    linkedBookingId?: string | null;
    // Unguessable token for the private /atelier/[token] Design Story page.
    // Optional only because fallback/demo rows predate 005.
    atelierToken?: string;
    // Kavya's headline note shown at the top of the Design Story page.
    designerNote?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// Payload accepted by the public submit endpoint (server sets status).
export type CustomDesignRequestInput = Omit<
    CustomDesignRequest,
    'id' | 'status' | 'createdAt' | 'updatedAt'
>;
