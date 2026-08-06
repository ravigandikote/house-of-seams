import { BlouseDesignAttributes } from './blouseDesign';
import { BottomsDesignAttributes } from './bottomsDesign';
import { KurtiDesignAttributes } from './kurtiDesign';
import { LehengaDesignAttributes } from './lehengaDesign';
import { Measurements } from './measurements';

// Matches the CHECK constraint on custom_design_requests.category exactly
// (widened by 010_request_category_expansion.sql). Only categories the app
// can actually accept live here — the DB CHECK pre-registers more.
export const REQUEST_CATEGORIES = ['blouse', 'lehenga', 'kurti', 'bottoms', 'salwar_suit', 'shirt', 'trousers'] as const;
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

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

// The client's inspiration images + occasion note (muse_board JSONB).
// imagePaths are object keys in the private muse-boards storage bucket —
// never URLs; every render signs them fresh via the service-role client.
export const MUSE_MAX_IMAGES = 4;
export const MUSE_NOTE_MAX_LENGTH = 280;

export interface MuseBoard {
    imagePaths: string[];
    occasionNote?: string | null;
}

// A pin Kavya drops on the submitted sketch (annotations JSONB).
// Coordinates are percentages of the rendered SVG box so pins land in the
// same spot at any resolution, in admin and on the atelier page.
export const SKETCH_VIEWS = ['front', 'back'] as const;
export type SketchView = (typeof SKETCH_VIEWS)[number];

export interface SketchAnnotation {
    id: string;
    view: SketchView;
    xPct: number;
    yPct: number;
    note: string;
    createdAt: string;
}

// Fields the admin panel may change on a request; statusNote becomes the
// note on the status event written for the change (never a column).
export interface AdminRequestUpdate {
    status?: RequestStatus;
    statusNote?: string;
    designerNote?: string | null;
    annotations?: SketchAnnotation[];
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

// Lehenga-journey preferences. The dupatta is a standard ~2.5m drape,
// matched to the ensemble by the boutique.
export interface LehengaPreferences {
    dupatta: boolean;
}

export type RequestPreferences = BlousePreferences | LehengaPreferences;

export function isBlousePreferences(p: RequestPreferences): p is BlousePreferences {
    return 'blouseOpening' in p;
}

// Denormalised copy of the chosen design at submit time, so the request
// stays meaningful if the design is later edited or deleted.
export interface DesignSnapshot extends BlouseDesignAttributes {
    name: string;
    slug: string;
}

// The choli of a lehenga ensemble IS a blouse — same attributes, same
// renderer, same measurement spec (labels say "Choli" in the UI).
export interface CholiSnapshot extends BlouseDesignAttributes {
    name: string;
    slug: string;
}

export interface LehengaDesignSnapshot extends LehengaDesignAttributes {
    name: string;
    slug: string;
    // null/absent = skirt only (a first-class choice, not a fallback)
    choli?: CholiSnapshot | null;
}

export interface KurtiDesignSnapshot extends KurtiDesignAttributes {
    name: string;
    slug: string;
}

// The bottoms half of a salwar suit (or a standalone bottoms request).
export interface BottomsSnapshot extends BottomsDesignAttributes {
    name: string;
    slug: string;
}

// A salwar suit = a kameez (kurti attributes) + its bottoms.
export interface SalwarSuitSnapshot extends KurtiDesignSnapshot {
    bottoms: BottomsSnapshot;
}

export type AnyDesignSnapshot =
    | DesignSnapshot
    | LehengaDesignSnapshot
    | KurtiDesignSnapshot
    | BottomsSnapshot
    | SalwarSuitSnapshot;

// Narrow a snapshot by shape (category is the authority where available).
export function isLehengaSnapshot(s: AnyDesignSnapshot): s is LehengaDesignSnapshot {
    return 'silhouette' in s;
}

export interface CustomDesignRequest {
    id: string;
    userId?: string | null;
    designId?: string | null;
    // Legacy rows (pre-008) have no category — treat missing as 'blouse'.
    category?: RequestCategory;
    designSnapshot: AnyDesignSnapshot;
    // Blouse rows carry the full 23-field Measurements; lehenga rows carry
    // the LEHENGA_MEASUREMENT_SPEC keys — cast at category boundaries.
    measurements: Measurements;
    selectedColor?: string | null;
    customerAge?: number | null;
    // Contact details support guest submissions (user_id nullable),
    // mirroring how bookings capture contact info.
    customerName: string;
    customerEmail?: string | null;
    customerPhone?: string | null;
    notes?: string | null;
    preferences?: RequestPreferences | null;
    status: RequestStatus;
    linkedBookingId?: string | null;
    // Unguessable token for the private /atelier/[token] Design Story page.
    // Optional only because fallback/demo rows predate 005.
    atelierToken?: string;
    // Kavya's headline note shown at the top of the Design Story page.
    designerNote?: string | null;
    museBoard?: MuseBoard | null;
    annotations?: SketchAnnotation[] | null;
    createdAt?: string;
    updatedAt?: string;
}

// Payload accepted by the public submit endpoint (server sets status).
export type CustomDesignRequestInput = Omit<
    CustomDesignRequest,
    'id' | 'status' | 'createdAt' | 'updatedAt'
>;
