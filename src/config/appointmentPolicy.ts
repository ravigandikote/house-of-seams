// Appointment policy for House of Seams design consultations.
// Modelled on standard boutique store-visit policies; every number that
// might change lives here so the policy page, the booking form, and the
// server validation always agree.

export const VISIT_TYPES = ['in-person', 'virtual'] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
    'in-person': 'In-Person Studio Visit',
    virtual: 'Virtual Consultation (Google Meet)',
};

export const APPOINTMENT_SERVICES = [
    'Custom Blouse Consultation',
    'Bridal Couture Consultation',
    'Alterations & Fitting',
    'General Studio Visit',
] as const;
export type AppointmentService = (typeof APPOINTMENT_SERVICES)[number];

// Bookable time slots (stored as text in bookings.time).
export const APPOINTMENT_SLOTS = [
    '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
] as const;

export const APPOINTMENT_POLICY = {
    // Booking fee (INR). Non-refundable, but fully adjustable against any
    // purchase or custom order placed within the adjustment window.
    feeInr: 500,
    purchaseAdjustWindowHours: 48,
    // Reschedule or cancel at least this many hours before the slot.
    rescheduleNoticeHours: 8,
    // Arrivals later than this are treated as a no-show.
    latenessCancelMinutes: { 'in-person': 15, virtual: 10 } as Record<VisitType, number>,
    // Larger groups are welcome with advance notice.
    maxGuestsWithoutNotice: 2,
} as const;
