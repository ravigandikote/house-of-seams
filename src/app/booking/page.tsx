import React from 'react';
import Link from 'next/link';
import BookingForm from '../../components/booking/BookingForm';
import { GoldDivider } from '../../components/ui/decor';
import { APPOINTMENT_POLICY } from '../../config/appointmentPolicy';

// "Book a Private Consultation" — the luxury framing of appointments.
// The optional ?ref= query carries a design-request reference from the
// customize confirmation / atelier page, stored on the booking so Kavya
// knows which design the conversation is about.
// NOTE: the old BookingCalendar/BookingConfirmation components are no
// longer used by this page — dead files kept for a later cleanup pass.

export const metadata = {
    title: 'Book a Private Consultation | House of Seams',
    description:
        'Reserve a one-on-one design consultation with Kavya — at the studio or over Google Meet.',
};

const BookingPage = ({ searchParams }: { searchParams?: { ref?: string } }) => {
    // Display reference only — sanitised, never trusted beyond rendering.
    const raw = searchParams?.ref?.trim().toUpperCase() ?? '';
    const requestReference = /^[A-Z0-9]{4,12}$/.test(raw) ? raw : null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Atelier</p>
            <h1 className="font-heading text-display-lg text-center text-ink mb-3">
                Book a Private Consultation
            </h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">
                An hour that belongs to you — your measurements, your fabrics, your occasion,
                with Kavya&apos;s full attention.
            </p>
            <GoldDivider className="mb-8" />

            <p className="text-center text-body-sm text-warm-gray mb-10 max-w-md mx-auto">
                Consultations are reserved with a{' '}
                <span className="text-ink font-medium">₹{APPOINTMENT_POLICY.feeInr} booking fee</span>,
                honoured in full against any order placed within{' '}
                {APPOINTMENT_POLICY.purchaseAdjustWindowHours} hours — it works like a credit toward
                your outfit. The full terms live on the{' '}
                <Link href="/appointment-policy" className="link-gold">appointment policy</Link> page.
            </p>

            <BookingForm requestReference={requestReference} />
        </div>
    );
};

export default BookingPage;
