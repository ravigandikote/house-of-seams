import { BlouseDesignAttributes } from './blouseDesign';
import { Measurements } from './measurements';

// Matches the CHECK constraint on custom_design_requests.status exactly.
export const REQUEST_STATUSES = ['submitted', 'reviewed', 'quoted', 'confirmed', 'cancelled'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

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
