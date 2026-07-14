import React from 'react';
import Link from 'next/link';
import {
    MeasurementField,
    MEASUREMENT_FIELDS,
    MEASUREMENT_LABELS,
    MEASUREMENT_RANGES,
} from '@/types/measurements';

export const metadata = {
    title: 'Blouse Measurement Guide | House of Seams',
    description:
        'How to take the eight blouse measurements used by our Design Your Blouse customizer — with a mind map and tailor-annotated diagrams.',
};

// How to take each measurement, and what it shapes in the blouse.
const GUIDE: Record<MeasurementField, { how: string; drives: string }> = {
    bust: {
        how: 'Around the fullest part of the bust, tape level across the back — snug, never tight.',
        drives: 'Shapes the blouse width at the chest',
    },
    waist: {
        how: 'A blouse ends above the natural waist — measure around the body exactly where the hem will sit.',
        drives: 'Shapes the hem and the taper',
    },
    shoulderWidth: {
        how: 'Across the back, from the edge of one shoulder bone to the other.',
        drives: 'Sets the shoulder line',
    },
    blouseLength: {
        how: 'From the highest point of the shoulder (beside the neck) straight down to the desired hem.',
        drives: 'Sets the overall length',
    },
    sleeveLength: {
        how: 'From the shoulder tip down the arm to where the sleeve should end — works together with the sleeve style (cap, short, elbow, three-quarter, full).',
        drives: 'Sets where the sleeve ends',
    },
    armhole: {
        how: 'Around the top of the arm at the shoulder joint, where the sleeve joins the body.',
        drives: 'Sets the depth of the sleeve opening',
    },
    frontNeckDepth: {
        how: 'From the shoulder line beside the neck, straight down the front to the lowest point of the neckline.',
        drives: 'How low the front neckline cuts',
    },
    backNeckDepth: {
        how: 'The same, down the back — deeper for deep-round, keyhole, or tie-back designs.',
        drives: 'How low the back cuts',
    },
};

const TIPS = [
    {
        title: 'Measure over the right layer',
        text: 'Take measurements over the inner-wear that will be worn with the blouse.',
    },
    {
        title: 'Keep one finger of ease',
        text: 'The tape should sit flat with room for one finger underneath.',
    },
    {
        title: 'When in doubt, round up',
        text: 'Fabric can always be taken in at the fitting — letting out is harder.',
    },
];

const MeasurementGuidePage = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal animate-fade-in-up">
                Blouse Measurement Guide
            </h1>
            <p className="text-center text-warm-gray mb-10 max-w-2xl mx-auto">
                Eight numbers turn a design into a blouse that fits. Here is what each one is, how to take
                it, and what it shapes — the same eight our customizer asks for and draws live.
            </p>

            {/* Mind map */}
            <section className="mb-14 animate-fade-in">
                <div className="bg-cream rounded-lg p-4 sm:p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/guide/mindmap.svg"
                        alt="Mind map of the eight blouse measurements, grouped into four families: around the body, across, down the body, and necklines"
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
                    Where each number lives
                </h2>
                <p className="text-warm-gray mb-6">
                    The same drawing you see in the customizer, annotated the way a tailor would.
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

            {/* How to measure */}
            <section className="mb-14">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
                    How each one is measured
                </h2>
                <p className="text-warm-gray mb-6">
                    The customizer accepts the ranges shown and will let you know if a value looks off.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MEASUREMENT_FIELDS.map((field) => {
                        const { min, max } = MEASUREMENT_RANGES[field];
                        return (
                            <div key={field} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="flex items-baseline justify-between mb-1">
                                    <h3 className="font-heading text-lg font-bold text-charcoal">
                                        {MEASUREMENT_LABELS[field]}
                                    </h3>
                                    <span className="text-xs font-semibold text-dusty-rose-dark whitespace-nowrap">
                                        {min}&ndash;{max}&Prime;
                                    </span>
                                </div>
                                <p className="text-sm text-warm-gray">{GUIDE[field].how}</p>
                                <p className="text-xs font-semibold text-sage-green-dark mt-3">
                                    ◆ {GUIDE[field].drives}
                                </p>
                            </div>
                        );
                    })}
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
