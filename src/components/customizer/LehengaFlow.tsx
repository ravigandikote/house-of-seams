'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AtelierStepper from './AtelierStepper';
import Button from '../ui/Button';
import LehengaPreview from './LehengaPreview';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import TextArea from '../ui/TextArea';
import { CornerFlourish, GoldDivider } from '../ui/decor';
import { SAMPLE_LEHENGA_DESIGNS } from './lehengaSamples';
import { submitCustomDesignRequest } from '../../services/customizerService';
import { LehengaDesign } from '../../types/lehengaDesign';
import { LEHENGA_MEASUREMENT_SPEC } from '../../types/lehengaMeasurements';
import { Measurements } from '../../types/measurements';

// Lehenga customizer: design pick → slider measurements → preview &
// submit. Requests go through the same pipeline as blouses
// (category: 'lehenga') — same Design Story journal, admin panel, and
// consultation bridge.

const STEPS = ['Choose Design', 'Measurements', 'Preview & Submit'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,15}$/;

const LehengaFlow: React.FC = () => {
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState<LehengaDesign | null>(null);
    const [color, setColor] = useState('#D6A6B1');
    const [values, setValues] = useState<Record<string, number>>({
        ...LEHENGA_MEASUREMENT_SPEC.typicalDefaults,
    });
    const [notes, setNotes] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [reference, setReference] = useState<string | null>(null);
    const [atelierToken, setAtelierToken] = useState<string | null>(null);

    const previewAttrs = selected ? { ...selected, baseColor: color } : null;
    const styleAttrs: Record<string, string> = selected
        ? { silhouette: selected.silhouette, closure: selected.closure, embellishment: selected.embellishment }
        : {};

    // Only the fields this silhouette actually asks for.
    const visibleFields = LEHENGA_MEASUREMENT_SPEC.fields.filter(
        (f) => !f.visibleWhen || f.visibleWhen(styleAttrs)
    );

    const handleSubmit = async () => {
        if (!selected) return;
        if (!customerName.trim()) {
            setSubmitError('Please enter your name.');
            return;
        }
        if (!customerEmail.trim() && !customerPhone.trim()) {
            setSubmitError('Please provide an email or phone number so the boutique can reach you.');
            return;
        }
        if (customerEmail.trim() && !EMAIL_RE.test(customerEmail.trim())) {
            setSubmitError('Please enter a valid email address.');
            return;
        }
        if (customerPhone.trim() && !PHONE_RE.test(customerPhone.trim())) {
            setSubmitError('Please enter a valid phone number.');
            return;
        }
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            const measurements = Object.fromEntries(
                visibleFields.map((f) => [f.key, values[f.key]])
            );
            const created = await submitCustomDesignRequest({
                category: 'lehenga',
                // Sample designs are local (no lehenga_designs table yet) —
                // the snapshot carries the full design.
                designId: null,
                designSnapshot: {
                    name: selected.name,
                    slug: selected.slug,
                    silhouette: selected.silhouette,
                    closure: selected.closure,
                    embellishment: selected.embellishment,
                    baseColor: selected.baseColor,
                },
                measurements: measurements as unknown as Measurements,
                selectedColor: color,
                customerAge: null,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                notes: notes || null,
                preferences: null,
            });
            setReference(created.id ? created.id.slice(0, 8).toUpperCase() : null);
            setAtelierToken(created.atelierToken ?? null);
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Celebratory confirmation — same moment as the blouse journey.
    if (submitted && previewAttrs) {
        const nextSteps = [
            { title: 'We review', text: 'Our designer studies your sketch and measurements.' },
            { title: 'We reach out', text: 'You receive a personal quote and fabric suggestions.' },
            { title: 'We create', text: 'Your lehenga is cut, stitched, and fitted to you.' },
        ];
        return (
            <div className="max-w-2xl mx-auto text-center py-8 animate-fade-in">
                <GoldDivider className="mb-8" />
                <p className="label-caps text-champagne-gold-dark mb-3">Request received</p>
                <h2 className="font-heading text-display-lg text-ink mb-3">
                    Beautifully done, {customerName.trim().split(' ')[0]}.
                </h2>
                <p className="font-accent italic text-lede text-warm-gray mb-2 max-w-md mx-auto">
                    Your lehenga has been handed to the atelier.
                </p>
                {reference && (
                    <p className="text-body-sm text-warm-gray mb-6">
                        Reference <span className="font-medium text-ink tracking-widest">{reference}</span>
                    </p>
                )}
                {atelierToken && (
                    <div className="mb-10">
                        <Link
                            href={`/atelier/${atelierToken}`}
                            className="label-caps inline-block bg-deep-rose text-white hover:bg-deep-rose-dark transition-colors duration-300 rounded-sm px-8 py-3.5 shadow-soft"
                        >
                            Follow your Design Story →
                        </Link>
                        <p className="font-accent italic text-body-sm text-warm-gray mt-3 max-w-sm mx-auto">
                            Your private journal — watch your lehenga move from sketch to stitching,
                            and share the page with anyone you love.
                        </p>
                    </div>
                )}
                <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-8 mb-10 max-w-xs mx-auto">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    <LehengaPreview styleAttributes={previewAttrs} measurements={values} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left sm:text-center">
                    {nextSteps.map((s, i) => (
                        <div key={s.title}>
                            <p className="font-heading text-headline text-champagne-gold-dark mb-1">{i + 1}</p>
                            <p className="font-heading text-body text-ink">{s.title}</p>
                            <p className="text-body-sm text-warm-gray mt-1">{s.text}</p>
                        </div>
                    ))}
                </div>
                <GoldDivider className="mb-8" />
                <p className="font-accent italic text-lede text-warm-gray mb-4 max-w-md mx-auto">
                    Prefer to finish your design together?
                </p>
                <Link
                    href={reference ? `/booking?ref=${reference}` : '/booking'}
                    className="link-gold text-body inline-block mb-8"
                >
                    Book a private consultation with Kavya →
                </Link>
                <div className="flex gap-6 justify-center">
                    <Link href="/products" className="link-gold text-body-sm">Browse Products</Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AtelierStepper steps={STEPS} current={step} />

            {/* Step 1: pick a design */}
            {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {SAMPLE_LEHENGA_DESIGNS.map((design) => {
                        const isSelected = selected?.id === design.id;
                        return (
                            <button
                                key={design.id}
                                type="button"
                                onClick={() => {
                                    setSelected(design);
                                    setColor(design.baseColor);
                                }}
                                className={`text-left bg-white rounded-sm overflow-hidden transition-all duration-300 border ${
                                    isSelected
                                        ? 'border-champagne-gold ring-1 ring-champagne-gold shadow-lift scale-[1.015]'
                                        : 'border-champagne-gold/25 shadow-soft hover:shadow-lift hover:-translate-y-1'
                                }`}
                            >
                                <div className="relative paper-card p-3">
                                    <CornerFlourish position="tl" />
                                    {isSelected && <CornerFlourish position="br" />}
                                    <LehengaPreview
                                        styleAttributes={design}
                                        measurements={LEHENGA_MEASUREMENT_SPEC.typicalDefaults}
                                    />
                                </div>
                                <div className="p-5 border-t border-champagne-gold/25">
                                    <h3 className="font-heading text-title text-ink">{design.name}</h3>
                                    {design.description && (
                                        <p className="font-accent italic text-body-sm text-warm-gray mt-1.5">{design.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {[design.silhouette, design.embellishment].map((attr) => (
                                            <span
                                                key={attr}
                                                className="label-caps text-[9px] text-champagne-gold-dark bg-ivory border border-champagne-gold/30 rounded-full px-2.5 py-1"
                                            >
                                                {attr.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Step 2: slider measurements with live preview */}
            {step === 1 && previewAttrs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="order-first md:order-last">
                        <div className="sticky top-2 md:top-24 z-10">
                            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Sketchbook</p>
                            <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-5 shadow-soft">
                                <CornerFlourish position="tl" />
                                <CornerFlourish position="br" />
                                <LehengaPreview
                                    styleAttributes={previewAttrs}
                                    measurements={values}
                                    className="max-w-[220px] sm:max-w-xs mx-auto"
                                />
                            </div>
                            <div className="flex justify-center gap-5 mt-4 flex-wrap">
                                {([
                                    ['Waist', values.waistRound],
                                    ['Hip', values.hipRound],
                                    ['Length', values.lehengaLength],
                                    ['Ghera', values.flareGhera],
                                ] as const).map(([label, num]) => (
                                    <div key={label} className="text-center">
                                        <p className="label-caps text-[9px] text-warm-gray">{label}</p>
                                        <p className="text-body text-ink tabular-nums">{num}&Prime;</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-body-sm text-warm-gray mb-5">
                            All values in inches — drag a slider or type an exact value. Detailed measuring
                            instructions for lehengas are coming soon in our{' '}
                            <Link href="/measurement-guide" target="_blank" className="link-gold">
                                measurement guide
                            </Link>
                            .
                        </p>
                        {LEHENGA_MEASUREMENT_SPEC.groups.map((group) => (
                            <MeasurementSliderGroup
                                key={group.key}
                                spec={LEHENGA_MEASUREMENT_SPEC}
                                group={group}
                                values={values}
                                styleAttrs={styleAttrs}
                                onChange={(key, v) => setValues((prev) => ({ ...prev, [key]: v }))}
                            />
                        ))}
                        <div className="mb-4">
                            <label className="label-caps block text-warm-gray">Lehenga Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="mt-1.5 block w-full h-11 rounded-sm !p-1"
                            />
                        </div>
                        <TextArea
                            label="Notes for the boutique (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Fabric preferences, dupatta, occasion, deadline..."
                        />
                    </div>
                </div>
            )}

            {/* Step 3: preview & submit */}
            {step === 2 && previewAttrs && selected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-6 h-fit">
                        <CornerFlourish position="tl" />
                        <CornerFlourish position="br" />
                        <LehengaPreview
                            styleAttributes={previewAttrs}
                            measurements={values}
                            className="max-w-sm mx-auto"
                        />
                    </div>
                    <div>
                        <p className="label-caps text-champagne-gold-dark mb-1.5">The Design Sheet</p>
                        <h3 className="font-heading text-headline text-ink mb-1">{selected.name}</h3>
                        <p className="font-accent italic text-body text-warm-gray mb-5">
                            Every number below was set by your hand.
                        </p>
                        <dl className="space-y-2 text-body-sm">
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Design</dt>
                                <dd className="text-charcoal font-medium">{selected.name}</dd>
                            </div>
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Color</dt>
                                <dd className="flex items-center gap-2">
                                    <span
                                        className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: color }}
                                    />
                                    {color}
                                </dd>
                            </div>
                            {visibleFields.map((f) => (
                                <div key={f.key} className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                    <dt className="text-warm-gray">{f.label}</dt>
                                    <dd className="text-charcoal">
                                        {values[f.key]}
                                        {f.unit === 'in' ? '″' : ''}
                                    </dd>
                                </div>
                            ))}
                            {notes && (
                                <div className="pt-2">
                                    <dt className="text-warm-gray mb-1">Notes</dt>
                                    <dd className="text-charcoal">{notes}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-6 bg-blush/60 border border-champagne-gold/25 rounded-sm p-4 text-body-sm text-charcoal">
                            Custom lehengas are individually quoted. Submit your design and the boutique will
                            get back to you with a price and next steps — no account needed.
                        </div>

                        {/* Signature block — mirrors the blouse journey. */}
                        <div className="mt-6 border border-champagne-gold/40 rounded-sm p-5 relative">
                            <CornerFlourish position="tr" />
                            <p className="font-accent italic text-lede text-ink mb-4">Signed for the atelier by…</p>
                            <div className="mb-4">
                                <label className="label-caps block text-warm-gray">Your Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <div className="mb-4">
                                    <label className="label-caps block text-warm-gray">Email</label>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="label-caps block text-warm-gray">Phone</label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                                    />
                                </div>
                            </div>
                            <p className="text-caption text-warm-gray -mt-2 mb-4">
                                Provide an email or a phone number so the boutique can reach you.
                            </p>

                            {submitError && (
                                <p className="text-body-sm text-red-500 mb-3" role="alert">{submitError}</p>
                            )}

                            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Sending to the atelier…' : 'Request My Design'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10">
                <Button
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(s - 1, 0))}
                    className={step === 0 ? 'invisible' : ''}
                >
                    Back
                </Button>
                {step < STEPS.length - 1 && (
                    <Button onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))} disabled={!selected}>
                        {step === 0 ? (selected ? 'Continue' : 'Select a design') : 'Preview'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default LehengaFlow;
