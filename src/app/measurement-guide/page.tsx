import React from 'react';
import Link from 'next/link';
import {
    MeasurementField,
    MEASUREMENT_DESCRIPTIONS,
    MEASUREMENT_GROUPS,
    MEASUREMENT_LABELS,
    MEASUREMENT_RANGES,
} from '@/types/measurements';

export const metadata = {
    title: 'Blouse Measurement Guide | House of Seams',
    description:
        'How to take the 23 standard blouse measurements used by our Design Your Blouse customizer — with a mind map and tailor-annotated diagrams.',
};

// What the core measurements shape in the live preview drawing.
const DRIVES: Partial<Record<MeasurementField, string>> = {
    bust: 'Shapes the blouse width at the chest',
    waist: 'Shapes the hem and the taper',
    shoulderWidth: 'Sets the shoulder line',
    blouseLength: 'Sets the overall length',
    sleeveLength: 'Sets where the sleeve ends',
    armhole: 'Sets the depth of the sleeve opening',
    frontNeckDepth: 'How low the front neckline cuts',
    backNeckDepth: 'How low the back cuts',
};

const ADDITIONAL_DETAILS = [
    { label: 'Blouse Opening', text: 'Front, back, or side zip — where the blouse fastens.' },
    { label: 'Cup Padding', text: 'Whether light padding is stitched in.' },
    { label: 'Fit Preference', text: 'Tight, regular, or comfortable.' },
    { label: 'Seam Allowance', text: 'Standard, or extra room left in the seams for future alterations.' },
    { label: 'Bra / Inner-wear Size', text: 'So the blouse is cut for what will be worn under it.' },
    { label: 'Design & Style Notes', text: 'Anything specific — fabric, lining, occasion, deadline.' },
];

const TIPS = [
    {
        title: 'Use a soft measuring tape',
        text: 'Measure over the inner-wear that will be worn with the blouse, tape parallel to the floor.',
    },
    {
        title: 'Keep one finger of ease',
        text: 'The tape should sit flat with room for one finger underneath — never pulled tight.',
    },
    {
        title: 'Recheck, and round up',
        text: 'Take each measurement twice. Fabric can be taken in at the fitting — letting out is harder.',
    },
];

const MeasurementGuidePage = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal animate-fade-in-up">
                Blouse Measurement Guide
            </h1>
            <p className="text-center text-warm-gray mb-10 max-w-2xl mx-auto">
                Twenty-three numbers turn a design into a blouse that fits perfectly. Here is what each one
                is, how to take it, and what it shapes — the same set our customizer asks for.
            </p>

            {/* Mind map */}
            <section className="mb-14 animate-fade-in">
                <div className="bg-cream rounded-lg p-4 sm:p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/guide/mindmap.svg"
                        alt="Mind map of the 23 standard blouse measurements grouped into upper body, neck, arm and sleeve, lengths, and waist and hips — plus the additional details we capture"
                        className="w-full h-auto"
                    />
                </div>
                <p className="text-center text-sm text-warm-gray italic mt-3">
                    All values are taken in inches — the standard for Indian tailoring.
                </p>
            </section>

            {/* Annotated diagrams */}
            <section className="mb-14">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
                    The core measurements, illustrated
                </h2>
                <p className="text-warm-gray mb-6">
                    The same drawing you see in the customizer, annotated the way a tailor would. These core
                    values drive the live preview; the full list below refines the final fit.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                    <div className="bg-cream rounded-lg p-4 md:col-span-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/guide/measure-front.svg"
                            alt="Front view of a blouse annotated with shoulder width, bust, waist, blouse length, sleeve length, armhole, and front neck depth"
                            className="w-full h-auto"
                        />
                    </div>
                    <div className="bg-cream rounded-lg p-4 md:col-span-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/guide/measure-back.svg"
                            alt="Back view of a blouse annotated with back neck depth"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </section>

            {/* How to measure, by group */}
            <section className="mb-14">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
                    How each one is measured
                </h2>
                <p className="text-warm-gray mb-6">
                    The customizer accepts the ranges shown and will let you know if a value looks off.
                </p>
                {MEASUREMENT_GROUPS.map((group) => (
                    <div key={group.id} className="mb-8">
                        <h3 className="font-heading text-lg font-bold text-charcoal border-b-2 border-dusty-rose inline-block pb-1 mb-4">
                            {group.label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.fields.map((field) => {
                                const { min, max } = MEASUREMENT_RANGES[field];
                                return (
                                    <div key={field} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <h4 className="font-heading text-base font-bold text-charcoal">
                                                {MEASUREMENT_LABELS[field]}
                                            </h4>
                                            <span className="text-xs font-semibold text-dusty-rose-dark whitespace-nowrap ml-2">
                                                {min}&ndash;{max}&Prime;
                                            </span>
                                        </div>
                                        <p className="text-sm text-warm-gray">{MEASUREMENT_DESCRIPTIONS[field]}</p>
                                        {DRIVES[field] && (
                                            <p className="text-xs font-semibold text-sage-green-dark mt-2">
                                                ◆ {DRIVES[field]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* Additional details */}
            <section className="mb-14">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">Additional details</h2>
                <p className="text-warm-gray mb-6">
                    Beyond the tape measure — a few choices that complete the order.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ADDITIONAL_DETAILS.map((d) => (
                        <div key={d.label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h4 className="font-heading text-base font-bold text-charcoal mb-1">{d.label}</h4>
                            <p className="text-sm text-warm-gray">{d.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips */}
            <section className="mb-14">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {TIPS.map((tip) => (
                        <div key={tip.title} className="border-l-4 border-dusty-rose pl-4">
                            <h3 className="font-semibold text-charcoal text-sm mb-1">{tip.title}</h3>
                            <p className="text-sm text-warm-gray">{tip.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="text-center bg-cream rounded-lg py-10 px-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
                    Ready to design yours?
                </h2>
                <p className="text-warm-gray mb-6">
                    Enter your age for a head start — every measurement stays fully editable, and the drawing
                    responds as you type.
                </p>
                <Link
                    href="/customize"
                    className="inline-block px-6 py-3 rounded bg-dusty-rose text-white hover:bg-dusty-rose-dark transition duration-200 font-medium"
                >
                    Design Your Blouse
                </Link>
            </section>
        </div>
    );
};

export default MeasurementGuidePage;
