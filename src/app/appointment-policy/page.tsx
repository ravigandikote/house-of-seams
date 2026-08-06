import React from 'react';
import Link from 'next/link';
import { CornerFlourish, GoldDivider } from '@/components/ui/decor';
import {
    APPOINTMENT_POLICY,
    VISIT_TYPE_LABELS,
} from '@/config/appointmentPolicy';

export const metadata = {
    title: 'Appointment Policy | House of Seams',
    description:
        'How appointments work at House of Seams: booking fee, in-person and virtual visits, rescheduling, and cancellation terms.',
};

const P = APPOINTMENT_POLICY;

const AppointmentPolicyPage = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Atelier</p>
            <h1 className="font-heading text-display-lg text-center text-ink mb-3">
                Appointment Policy
            </h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">
                Every appointment is a dedicated one-on-one session for your custom designs —
                here is how booking works.
            </p>
            <GoldDivider className="mb-10" />

            {/* Fee */}
            <section className="relative paper-card border border-champagne-gold/40 rounded-sm p-7 mb-8 text-center">
                <CornerFlourish position="tl" />
                <CornerFlourish position="br" />
                <p className="font-heading text-display text-ink mb-1">₹{P.feeInr}</p>
                <p className="text-warm-gray text-body-sm max-w-md mx-auto">
                    Booking fee per appointment. Non-refundable — but{' '}
                    <strong className="text-ink font-medium">
                        fully adjustable against any purchase or custom order placed within{' '}
                        {P.purchaseAdjustWindowHours} hours
                    </strong>{' '}
                    of your visit, so it works like a credit toward your outfit.
                </p>
            </section>

            {/* Visit types */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                <div className="bg-white border border-champagne-gold/30 rounded-sm p-6 shadow-soft">
                    <h2 className="font-heading text-title text-ink mb-3">
                        {VISIT_TYPE_LABELS['in-person']}
                    </h2>
                    <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-warm-gray">
                        <li>A relaxed studio session — explore fabrics, embroidery samples, and past work.</li>
                        <li>Our studio is a design space, not a walk-in commercial store — visits are by appointment only.</li>
                        <li>
                            Up to {P.maxGuestsWithoutNotice} guests per appointment; larger groups are welcome
                            with advance notice.
                        </li>
                        <li>
                            Arrivals more than {P.latenessCancelMinutes['in-person']} minutes late are treated
                            as a no-show and the slot is released.
                        </li>
                    </ul>
                </div>
                <div className="bg-white border border-champagne-gold/30 rounded-sm p-6 shadow-soft">
                    <h2 className="font-heading text-title text-ink mb-3">
                        {VISIT_TYPE_LABELS.virtual}
                    </h2>
                    <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-warm-gray">
                        <li>A Google Meet session from wherever you are — the meeting link is shared once your slot is confirmed.</li>
                        <li>
                            Keep a <strong className="text-ink font-medium">soft measuring tape</strong> handy — we
                            will walk you through your measurements together. Our{' '}
                            <Link href="/measurement-guide" className="link-gold">
                                measurement guide
                            </Link>{' '}
                            shows how each one is taken.
                        </li>
                        <li>Collections and fabrics are shown on camera, and orders can be placed right away.</li>
                        <li>
                            Joining more than {P.latenessCancelMinutes.virtual} minutes late is treated as a
                            no-show.
                        </li>
                    </ul>
                </div>
            </section>

            {/* Terms */}
            <section className="mb-12">
                <p className="label-caps text-champagne-gold-dark mb-1.5">The fine print</p>
                <h2 className="font-heading text-headline text-ink mb-5">Terms, plainly stated</h2>
                <ul className="space-y-3 text-body-sm text-warm-gray">
                    {[
                        `Rescheduling or cancellation requires at least ${P.rescheduleNoticeHours} hours' notice before your slot — reach us on WhatsApp or the contact page.`,
                        'The booking fee is not refunded for no-shows, late cancellations, or if no purchase is made — it is a commitment to a dedicated slot, not a product.',
                        `The fee adjustment applies to any purchase or custom order placed within ${P.purchaseAdjustWindowHours} hours of the appointment.`,
                        'The boutique may need to reschedule due to operational constraints — in that case your fee carries over to the new slot in full.',
                        'Custom design requests submitted through the online customizer are quoted separately; your appointment fee still adjusts against that order.',
                    ].map((term) => (
                        <li key={term} className="flex gap-3">
                            <span className="text-champagne-gold mt-0.5" aria-hidden="true">◆</span>
                            <span>{term}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* CTA */}
            <section className="text-center bg-blush/50 border border-champagne-gold/30 rounded-sm py-10 px-6">
                <h2 className="font-heading text-headline text-ink mb-2">Ready when you are</h2>
                <p className="font-accent italic text-body text-warm-gray mb-6">
                    Pick a date and we&apos;ll confirm your slot along with payment details.
                </p>
                <Link
                    href="/booking"
                    className="label-caps inline-block px-7 py-3 rounded-sm bg-deep-rose text-white hover:bg-deep-rose-dark transition-colors duration-300"
                >
                    Book a Private Consultation
                </Link>
            </section>
        </div>
    );
};

export default AppointmentPolicyPage;
