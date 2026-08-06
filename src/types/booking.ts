import { VisitType } from '../config/appointmentPolicy';

// Matches the CHECK constraints on the bookings table exactly.
export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface Booking {
    id: string;
    customerName: string;
    email?: string | null;
    phone?: string | null;
    date?: string | null;
    time?: string | null;
    service?: string | null;
    notes?: string | null;
    status: BookingStatus;
    visitType?: VisitType | null;
    policyAcceptedAt?: string | null;
    // Display reference of the design request this consultation is about
    // (e.g. "295ADC72"), carried from the customize/atelier CTA.
    requestReference?: string | null;
    userId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
