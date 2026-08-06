import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnnotatedSketch from '@/components/atelier/AnnotatedSketch';
import ShareBar from '@/components/atelier/ShareBar';
import StoryTimeline from '@/components/atelier/StoryTimeline';
import { CornerFlourish, GoldDivider } from '@/components/ui/decor';
import { getDesignStoryByToken } from '@/lib/designStory';
import { MEASUREMENT_LABELS, MeasurementField } from '@/types/measurements';

// The Design Story portal — a private, shareable design journal for one
// custom request. The unguessable token in the URL is the only auth
// (see src/lib/designStory.ts). PRIVACY RULES for this page:
//   * first name only — never the full name
//   * never email, phone, or any address
//   * noindex — the link is shared person-to-person, not discovered

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Your Design Story | House of Seams',
    robots: { index: false, follow: false },
};

// Spec-sheet highlights — the numbers a client recognises at a glance.
const KEY_FIELDS: readonly MeasurementField[] = [
    'bust',
    'waist',
    'shoulderWidth',
    'blouseLength',
    'sleeveLength',
    'armhole',
];

function labelize(value: string): string {
    return value
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const DemoFallback = () => (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <GoldDivider className="mb-8" />
        <p className="label-caps text-champagne-gold-dark mb-3">The Atelier Journal</p>
        <h1 className="font-heading text-display text-ink mb-4">The journal is resting</h1>
        <p className="font-accent italic text-lede text-warm-gray">
            Design Stories open once the boutique&apos;s records are connected. Please check back soon.
        </p>
        <GoldDivider className="mt-8" />
    </div>
);

const AtelierPage = async ({ params }: { params: { token: string } }) => {
    const result = await getDesignStoryByToken(params.token);
    if (result.kind === 'demo') return <DemoFallback />;
    if (result.kind === 'not_found') notFound();

    const { request, events, museImageUrls } = result.story;
    const firstName = request.customerName.trim().split(/\s+/)[0];
    const design = {
        ...request.designSnapshot,
        baseColor: request.selectedColor || request.designSnapshot.baseColor,
    };
    const keyMeasurements = KEY_FIELDS.filter(
        (f) => typeof request.measurements[f] === 'number'
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
            {/* ——— Header ——— */}
            <header className="text-center mb-10">
                <p className="label-caps text-champagne-gold-dark mb-3">House of Seams · Atelier Journal</p>
                <h1 className="font-heading text-display-lg text-ink mb-3">
                    The Design Story of {firstName}
                </h1>
                <p className="font-accent italic text-lede text-warm-gray max-w-md mx-auto">
                    A private journal of your garment&apos;s making — from first sketch to final stitch.
                </p>
                <GoldDivider className="mt-6" />
                {request.designerNote && (
                    <blockquote className="mt-8 max-w-lg mx-auto">
                        <p className="font-accent italic text-headline text-charcoal">
                            &ldquo;{request.designerNote}&rdquo;
                        </p>
                        <cite className="label-caps text-[10px] text-champagne-gold-dark not-italic block mt-3">
                            — Kavya, your designer
                        </cite>
                    </blockquote>
                )}
                {/* The client's Muse Board — inspiration images via short-lived
                    signed URLs (private bucket) + the occasion note. */}
                {(museImageUrls.length > 0 || request.museBoard?.occasionNote) && (
                    <div className="mt-10">
                        <p className="label-caps text-champagne-gold-dark mb-4">Inspiration</p>
                        {museImageUrls.length > 0 && (
                            <div className="flex justify-center gap-3 flex-wrap">
                                {museImageUrls.map((src, i) => (
                                    <div
                                        key={src}
                                        className="w-20 h-20 sm:w-24 sm:h-24 bg-cream border border-champagne-gold/40 rounded-sm overflow-hidden shadow-soft rotate-[-1.5deg] even:rotate-[1.5deg]"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={src}
                                            alt={`Inspiration ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {request.museBoard?.occasionNote && (
                            <p className="font-accent italic text-body text-warm-gray mt-4 max-w-md mx-auto">
                                &ldquo;{request.museBoard.occasionNote}&rdquo;
                            </p>
                        )}
                    </div>
                )}
            </header>

            {/* ——— The sketch (with Kavya's pins when she has annotated) ——— */}
            <section className="mb-12">
                <p className="label-caps text-champagne-gold-dark text-center mb-4">The Sketch</p>
                <AnnotatedSketch
                    design={design}
                    measurements={request.measurements}
                    annotations={request.annotations ?? []}
                />
            </section>

            {/* ——— Spec sheet ——— */}
            <section className="mb-14">
                <div className="relative bg-white border border-champagne-gold/30 rounded-sm shadow-soft p-6 sm:p-8">
                    <CornerFlourish position="tr" />
                    <p className="label-caps text-champagne-gold-dark mb-1.5">The Design Sheet</p>
                    <h2 className="font-heading text-headline text-ink mb-5">{request.designSnapshot.name}</h2>
                    <dl className="space-y-2 text-body-sm">
                        <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                            <dt className="text-warm-gray">Neckline / Back / Sleeves</dt>
                            <dd className="text-charcoal text-right">
                                {labelize(design.neckStyle)} · {labelize(design.backStyle)} ·{' '}
                                {labelize(design.sleeveStyle)}
                            </dd>
                        </div>
                        <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                            <dt className="text-warm-gray">Colour</dt>
                            <dd className="flex items-center gap-2">
                                <span
                                    className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: design.baseColor }}
                                />
                                {design.baseColor}
                            </dd>
                        </div>
                        {request.preferences && (
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Opening / Fit / Seams</dt>
                                <dd className="text-charcoal text-right">
                                    {labelize(request.preferences.blouseOpening)} ·{' '}
                                    {labelize(request.preferences.fitPreference)} ·{' '}
                                    {labelize(request.preferences.seamAllowance)}
                                </dd>
                            </div>
                        )}
                    </dl>
                    {keyMeasurements.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6 text-center">
                            {keyMeasurements.map((field) => (
                                <div key={field}>
                                    <p className="label-caps text-[9px] text-warm-gray">{MEASUREMENT_LABELS[field]}</p>
                                    <p className="text-body text-ink tabular-nums mt-0.5">
                                        {request.measurements[field]}&Prime;
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ——— The journey ——— */}
            <section className="mb-14">
                <p className="label-caps text-champagne-gold-dark text-center mb-2">The Journey</p>
                <h2 className="font-heading text-display text-ink text-center mb-8">Chapter by chapter</h2>
                <StoryTimeline events={events} currentStatus={request.status} />
            </section>

            {/* ——— Consultation bridge ——— */}
            <section className="text-center mb-14">
                <div className="relative bg-blush/50 border border-champagne-gold/30 rounded-sm p-7 max-w-lg mx-auto">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    <p className="font-accent italic text-lede text-charcoal mb-4">
                        Prefer to finish your design together?
                    </p>
                    <Link
                        href={`/booking?ref=${request.id.slice(0, 8).toUpperCase()}`}
                        className="label-caps inline-block bg-deep-rose text-white hover:bg-deep-rose-dark transition-colors duration-300 rounded-sm px-7 py-3"
                    >
                        Book a private consultation with Kavya
                    </Link>
                </div>
            </section>

            {/* ——— Share ——— */}
            <footer className="text-center">
                <GoldDivider className="mb-8" />
                <p className="font-accent italic text-lede text-warm-gray mb-5">
                    This page is yours to share — it shows your design, never your contact details.
                </p>
                <ShareBar />
            </footer>
        </div>
    );
};

export default AtelierPage;
