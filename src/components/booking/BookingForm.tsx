'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import SelectField from '../ui/SelectField';
import TextArea from '../ui/TextArea';
import { CornerFlourish, GoldDivider } from '../ui/decor';
import {
    APPOINTMENT_POLICY,
    APPOINTMENT_SERVICES,
    APPOINTMENT_SLOTS,
    VISIT_TYPES,
    VISIT_TYPE_LABELS,
    VisitType,
} from '../../config/appointmentPolicy';

// The Private Consultation booking form. Couture-styled to match the
// customizer journeys; submits to /api/booking/submit which also registers
// the customer in the boutique's customer database.

interface BookingFormProps {
    /** Design-request reference (e.g. "295ADC72") when the consultation is
     *  booked from the customize confirmation or an atelier page. */
    requestReference?: string | null;
}

interface FormState {
    customerName: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    service: string;
    visitType: VisitType;
    notes: string;
    policyAccepted: boolean;
}

const initialForm: FormState = {
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: APPOINTMENT_SLOTS[0],
    service: APPOINTMENT_SERVICES[0],
    visitType: 'in-person',
    notes: '',
    policyAccepted: false,
};

const BookingForm: React.FC<BookingFormProps> = ({ requestReference = null }) => {
    const [form, setForm] = useState<FormState>(
        requestReference ? { ...initialForm, service: 'Custom Blouse Consultation' } : initialForm
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState<FormState | null>(null);

    const today = new Date().toISOString().slice(0, 10);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.email.trim() && !form.phone.trim()) {
            setError('Please provide an email or phone number so we can confirm your appointment.');
            return;
        }
        if (!form.policyAccepted) {
            setError('Please read and accept the appointment policy to book.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/booking/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, requestReference }),
            });
            if (!res.ok) {
                const body = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(body?.error || 'Something went wrong. Please try again.');
            }
            setConfirmed(form);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (confirmed) {
        return (
            <div className="max-w-lg mx-auto text-center py-8 animate-fade-in">
                <GoldDivider className="mb-8" />
                <p className="label-caps text-champagne-gold-dark mb-3">Consultation requested</p>
                <h2 className="font-heading text-display text-ink mb-3">
                    We look forward to meeting you, {confirmed.customerName.trim().split(/\s+/)[0]}.
                </h2>
                <p className="font-accent italic text-lede text-warm-gray mb-8 max-w-md mx-auto">
                    The boutique will confirm your slot and share payment details for the
                    ₹{APPOINTMENT_POLICY.feeInr} reservation
                    {confirmed.visitType === 'virtual' ? ', along with your Google Meet link' : ''}.
                </p>
                <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-6 mb-8 text-left">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    <dl className="space-y-2 text-body-sm">
                        <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                            <dt className="text-warm-gray">Visit</dt>
                            <dd className="text-ink font-medium">{VISIT_TYPE_LABELS[confirmed.visitType]}</dd>
                        </div>
                        <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                            <dt className="text-warm-gray">Service</dt>
                            <dd className="text-ink font-medium">{confirmed.service}</dd>
                        </div>
                        <div className="flex justify-between pb-1">
                            <dt className="text-warm-gray">Date &amp; Time</dt>
                            <dd className="text-ink font-medium">{confirmed.date} · {confirmed.time}</dd>
                        </div>
                        {requestReference && (
                            <div className="flex justify-between border-t border-champagne-gold/15 pt-2">
                                <dt className="text-warm-gray">Your design</dt>
                                <dd className="text-champagne-gold-dark tracking-widest">{requestReference}</dd>
                            </div>
                        )}
                    </dl>
                </div>
                <p className="text-body-sm text-warm-gray">
                    The reservation is honoured in full against any order placed within{' '}
                    {APPOINTMENT_POLICY.purchaseAdjustWindowHours} hours of your visit.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {requestReference && (
                <p className="text-center">
                    <span className="label-caps text-[10px] text-champagne-gold-dark bg-ivory border border-champagne-gold/40 rounded-full px-4 py-1.5 inline-block">
                        Regarding your design · {requestReference}
                    </span>
                </p>
            )}

            {/* Visit type — two choice cards */}
            <div>
                <span className="label-caps block text-warm-gray mb-2.5">Visit Type</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {VISIT_TYPES.map((type) => {
                        const active = form.visitType === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setForm({ ...form, visitType: type })}
                                className={`relative text-left rounded-sm border px-4 py-3.5 transition-all duration-300 ${
                                    active
                                        ? 'border-champagne-gold ring-1 ring-champagne-gold bg-ivory shadow-soft'
                                        : 'border-champagne-gold/30 bg-white hover:border-champagne-gold/60 hover:-translate-y-0.5'
                                }`}
                            >
                                {active && <CornerFlourish position="tr" />}
                                <span className="block font-heading text-body text-ink">{VISIT_TYPE_LABELS[type]}</span>
                                <span className="font-accent italic block text-body-sm text-warm-gray mt-1">
                                    {type === 'virtual'
                                        ? 'From anywhere — keep a measuring tape handy'
                                        : 'Fabrics, embroidery samples, and chai at the studio'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="label-caps block text-warm-gray">Your Name</label>
                <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <div>
                    <label className="label-caps block text-warm-gray">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                    />
                </div>
                <div>
                    <label className="label-caps block text-warm-gray">Phone</label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                    />
                </div>
            </div>
            <p className="text-caption text-warm-gray -mt-3">
                Provide an email or a phone number so we can confirm your slot.
            </p>

            <SelectField
                label="Service"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                options={APPOINTMENT_SERVICES.map((s) => ({ value: s, label: s }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <div>
                    <label className="label-caps block text-warm-gray">Date</label>
                    <input
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                        required
                    />
                </div>
                <SelectField
                    label="Time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    options={APPOINTMENT_SLOTS.map((t) => ({ value: t, label: t }))}
                />
            </div>

            <TextArea
                label="Anything we should know? (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Occasion, ideas, number of guests..."
            />

            {/* Policy consent */}
            <div className="bg-blush/60 border border-champagne-gold/25 rounded-sm p-5">
                <p className="label-caps text-champagne-gold-dark mb-3">The policy, in brief</p>
                <ul className="space-y-1.5 text-body-sm text-warm-gray list-disc pl-5">
                    <li>
                        A ₹{APPOINTMENT_POLICY.feeInr} reservation holds your time with Kavya — honoured in
                        full against any order placed within {APPOINTMENT_POLICY.purchaseAdjustWindowHours}{' '}
                        hours of your visit.
                    </li>
                    <li>
                        Reschedule or cancel at least {APPOINTMENT_POLICY.rescheduleNoticeHours} hours before
                        your slot.
                    </li>
                    <li>
                        Arrivals more than {APPOINTMENT_POLICY.latenessCancelMinutes['in-person']} minutes late
                        (in-person) or {APPOINTMENT_POLICY.latenessCancelMinutes.virtual} minutes (virtual) are
                        treated as a no-show.
                    </li>
                </ul>
                <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.policyAccepted}
                        onChange={(e) => setForm({ ...form, policyAccepted: e.target.checked })}
                        className="mt-0.5 accent-deep-rose"
                        required
                    />
                    <span className="text-body-sm text-charcoal">
                        I have read and accept the{' '}
                        <Link href="/appointment-policy" target="_blank" className="link-gold">
                            full appointment policy
                        </Link>
                        .
                    </span>
                </label>
            </div>

            {error && <p className="text-body-sm text-red-500" role="alert">{error}</p>}

            <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Reserving your time…' : 'Reserve My Consultation'}
            </Button>
        </form>
    );
};

export default BookingForm;
