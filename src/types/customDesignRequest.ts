import { BlouseDesignAttributes } from './blouseDesign';
import { Measurements } from './measurements';

// Matches the CHECK constraint on custom_design_requests.status exactly.
export const REQUEST_STATUSES = ['submitted', 'reviewed', 'quoted', 'confirmed', 'cancelled'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

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
    createdAt?: string;
    updatedAt?: string;
}

// Payload accepted by the public submit endpoint (server sets status).
export type CustomDesignRequestInput = Omit<
    CustomDesignRequest,
    'id' | 'status' | 'createdAt' | 'updatedAt'
>;
