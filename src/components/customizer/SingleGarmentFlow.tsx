'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AtelierStepper from './AtelierStepper';
import Button from '../ui/Button';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import MuseBoardPanel from './MuseBoardPanel';
import TextArea from '../ui/TextArea';
import { CornerFlourish, GoldDivider } from '../ui/decor';
import { renderGarment } from './rendererRegistry';
import { downloadGarmentDesignPdf } from '../../lib/garmentDesignPdf';
import { submitCustomDesignRequest } from '../../services/customizerService';
import { CustomizerCategory } from '../../types/customizerCategories';
import { GarmentDesign } from '../../types/garmentDesign';
import { PatternListing } from '../../types/pattern';
import RelatedPatternCard from '../commerce/RelatedPatternCard';
import {
    MEASUREMENT_FIELDS,
    Measurements,
    MeasurementDefault,
    MeasurementField,
    bracketValue,
    findBracketForAge,
} from '../../types/measurements';
import { RequestCategory } from '../../types/customDesignRequest';
import { StyleAttributes, clampToSpec, effectiveField } from '../../types/measurementSpec';

// THE generic single-garment journey. Any manifest category with a
// single renderer + garment_designs source gets the full experience from
// this one component: design cards → sliders (visibleWhen + per-style
// ranges honoured) → preview & submit into the shared request pipeline
// (Design Story, admin, annotations, consultations — all downstream).
// Adding such a category = spec + styles + renderer + manifest entry;
// this file does not change.

const STEPS = ['Choose Design', 'Measurements', 'Preview & Submit'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,15}$/;
const DEFAULT_AGE = 25;

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

interface SingleGarmentFlowProps {
    category: CustomizerCategory;
    designs: GarmentDesign[];
    brackets: MeasurementDefault[];
    patterns?: PatternListing[];
}

const SingleGarmentFlow: React.FC<SingleGarmentFlowProps> = ({ category, designs, brackets, patterns = [] }) => {
    const relatedPattern = (slug: string | undefined): PatternListing | null =>
        (slug && patterns.find((l) => l.product && l.profile.relatedDesignSlugs.includes(slug))) || null;
    const spec = category.spec!;
    const rendererId = category.renderer?.kind === 'single' ? category.renderer.rendererId : 'blouse';
    // Spec keys shared with the blouse chart can prefill from age brackets.
    const bracketKeys = spec.fields
        .map((f) => f.key)
        .filter((k): k is MeasurementField => (MEASUREMENT_FIELDS as readonly string[]).includes(k));
    const useAgePrefill = category.bracketSet === 'adult' && brackets.length > 0 && bracketKeys.length > 0;

    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState<GarmentDesign | null>(null);
    const [color, setColor] = useState('#D6A6B1');
    const [values, setValues] = useState<Record<string, number>>({ ...spec.typicalDefaults });
    const [age, setAge] = useState(DEFAULT_AGE);
    const [notes, setNotes] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [reference, setReference] = useState<string | null>(null);
    const [atelierToken, setAtelierToken] = useState<string | null>(null);
    // Muse Board (uploaded AFTER submit, keyed by the atelier token) and
    // the design-sheet PDF — the same trims every journey gets.
    const [museFiles, setMuseFiles] = useState<File[]>([]);
    const [museNote, setMuseNote] = useState('');
    const [museWarning, setMuseWarning] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const sketchRef = useRef<HTMLDivElement>(null);

    const styleAttrs: StyleAttributes = selected
        ? (Object.fromEntries(
              Object.entries(selected.styleAttributes).filter(([k]) => k !== 'baseColor')
          ) as StyleAttributes)
        : {};
    const previewStyle = selected ? { ...selected.styleAttributes, baseColor: color } : null;
    const visibleFields = spec.fields
        .filter((f) => !f.visibleWhen || f.visibleWhen(styleAttrs))
        .map((f) => effectiveField(f, styleAttrs));

    // Style changes can move ranges (rangeWhen) — clamp values into them.
    const selectDesign = (design: GarmentDesign) => {
        setSelected(design);
        setColor(design.styleAttributes.baseColor ?? '#D6A6B1');
        const attrs = Object.fromEntries(
            Object.entries(design.styleAttributes).filter(([k]) => k !== 'baseColor')
        ) as StyleAttributes;
        setValues((prev) => {
            const next = { ...prev };
            for (const field of spec.fields) {
                const eff = effectiveField(field, attrs);
                next[field.key] = clampToSpec(eff, prev[field.key] ?? eff.defaultValue);
            }
            return next;
        });
    };

    // Age prefill for chart fields shared with the blouse (bracket-edge
    // behaviour mirrors CustomizerFlow: only re-applies on bracket change).
    const lastBracketId = useRef<string | null>(null);
    useEffect(() => {
        if (!useAgePrefill) return;
        const bracket = findBracketForAge(brackets, Number(age));
        if (bracket && bracket.id !== lastBracketId.current) {
            lastBracketId.current = bracket.id;
            setValues((prev) => {
                const next = { ...prev };
                for (const key of bracketKeys) next[key] = bracketValue(bracket, key);
                return next;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [age, brackets, useAgePrefill]);

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
            const measurements = Object.fromEntries(visibleFields.map((f) => [f.key, values[f.key]]));
            const created = await submitCustomDesignRequest({
                category: category.id as RequestCategory,
                designId: null,
                designSnapshot: {
                    name: selected.name,
                    slug: selected.slug,
                    ...selected.styleAttributes,
                } as unknown as Parameters<typeof submitCustomDesignRequest>[0]['designSnapshot'],
                measurements: measurements as unknown as Measurements,
                selectedColor: color,
                customerAge: useAgePrefill ? Number(age) || null : null,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                notes: notes || null,
                preferences: null,
            });
            setReference(created.id ? created.id.slice(0, 8).toUpperCase() : null);
            setAtelierToken(created.atelierToken ?? null);
            if (created.atelierToken && (museFiles.length > 0 || museNote.trim())) {
                try {
                    const fd = new FormData();
                    fd.append('token', created.atelierToken);
                    fd.append('occasionNote', museNote.trim());
                    museFiles.forEach((f) => fd.append('images', f));
                    const res = await fetch('/api/customize/muse-upload', { method: 'POST', body: fd });
                    if (!res.ok) throw new Error();
                } catch {
                    setMuseWarning(
                        'Your design is safely submitted, but the inspiration images could not be attached — you can send them to the boutique on WhatsApp instead.'
                    );
                }
            }
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGeneratePdf = async () => {
        if (!selected || !sketchRef.current) return;
        setPdfError(null);
        setIsGeneratingPdf(true);
        try {
            await downloadGarmentDesignPdf(
                {
                    categoryLabel: category.label,
                    designName: selected.name,
                    styleLine: Object.entries(selected.styleAttributes)
                        .filter(([k]) => k !== 'baseColor')
                        .map(([, v]) => labelize(v))
                        .join('  ·  ') + `  ·  Colour ${color}`,
                    rows: visibleFields.map((f) => {
                        const group = spec.groups.find((g) => g.key === f.group);
                        return {
                            group: group?.label ?? 'Measurements',
                            label: f.label,
                            value: `${values[f.key]}${f.unit === 'in' ? '"' : ''}`,
                        };
                    }),
                    notes: notes || null,
                },
                sketchRef.current
            );
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : 'Could not generate the PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Celebratory confirmation — the shared atelier moment.
    if (submitted && previewStyle) {
        const nextSteps = [
            { title: 'We review', text: 'Our designer studies your sketch and measurements.' },
            { title: 'We reach out', text: 'You receive a personal quote and fabric suggestions.' },
            { title: 'We create', text: `Your ${category.label.toLowerCase()} is cut, stitched, and fitted to you.` },
        ];
        return (
            <div className="max-w-2xl mx-auto text-center py-8 animate-fade-in">
                <GoldDivider className="mb-8" />
                <p className="label-caps text-champagne-gold-dark mb-3">Request received</p>
                <h2 className="font-heading text-display-lg text-ink mb-3">
                    Beautifully done, {customerName.trim().split(' ')[0]}.
                </h2>
                <p className="font-accent italic text-lede text-warm-gray mb-2 max-w-md mx-auto">
                    Your design has been handed to the atelier.
                </p>
                {museWarning && (
                    <p className="text-body-sm text-warm-gray bg-blush/60 border border-champagne-gold/25 rounded-sm px-4 py-3 mb-4 max-w-md mx-auto" role="alert">
                        {museWarning}
                    </p>
                )}
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
                            Your private journal — watch your design move from sketch to stitching,
                            and share the page with anyone you love.
                        </p>
                    </div>
                )}
                <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-8 mb-10 max-w-xs mx-auto">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    {renderGarment(rendererId, { style: previewStyle, measurements: values })}
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
                <div className="animate-fade-in">
                    {designs.length === 0 && (
                        <p className="text-center text-warm-gray py-16">
                            This atelier shelf is being stocked — please check back soon, or{' '}
                            <Link href="/booking" className="link-gold">book a consultation</Link>.
                        </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {designs.map((design) => {
                            const isSelected = selected?.id === design.id;
                            const chips = Object.entries(design.styleAttributes)
                                .filter(([k]) => k !== 'baseColor')
                                .slice(0, 3)
                                .map(([, v]) => v);
                            return (
                                <button
                                    key={design.id}
                                    type="button"
                                    onClick={() => selectDesign(design)}
                                    className={`text-left bg-white rounded-sm overflow-hidden transition-all duration-300 border touch-manipulation ${
                                        isSelected
                                            ? 'border-champagne-gold ring-1 ring-champagne-gold shadow-lift scale-[1.015]'
                                            : 'border-champagne-gold/25 shadow-soft active:border-champagne-gold active:shadow-lift [@media(hover:hover)]:hover:shadow-lift [@media(hover:hover)]:hover:-translate-y-1'
                                    }`}
                                >
                                    <div className="relative paper-card p-4">
                                        <CornerFlourish position="tl" />
                                        {isSelected && <CornerFlourish position="br" />}
                                        {design.isSignature && (
                                            <span className="absolute top-2 right-2 label-caps text-[9px] text-champagne-gold-dark">
                                                ★ Signature
                                            </span>
                                        )}
                                        {renderGarment(rendererId, {
                                            style: design.styleAttributes,
                                            measurements: spec.typicalDefaults,
                                            className: 'max-w-[220px] mx-auto',
                                        })}
                                    </div>
                                    <div className="p-5 border-t border-champagne-gold/25">
                                        <h3 className="font-heading text-title text-ink">{design.name}</h3>
                                        {design.description && (
                                            <p className="font-accent italic text-body-sm text-warm-gray mt-1.5">{design.description}</p>
                                        )}
                                        {design.designerNote && (
                                            <p className="text-caption text-champagne-gold-dark mt-2">— {design.designerNote}</p>
                                        )}
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {chips.map((attr) => (
                                                <span
                                                    key={attr}
                                                    className="label-caps text-[9px] text-champagne-gold-dark bg-ivory border border-champagne-gold/30 rounded-full px-2.5 py-1"
                                                >
                                                    {labelize(attr)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-center mt-8">
                        <Link href={`/patterns?category=${category.id}`} className="link-gold text-body-sm">
                            Sew it yourself — browse {category.label.toLowerCase()} patterns →
                        </Link>
                    </p>
                </div>
            )}

            {/* Step 2: measurements with live preview */}
            {step === 1 && previewStyle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="order-first md:order-last">
                        <div className="sticky top-2 md:top-24 z-10">
                            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Sketchbook</p>
                            <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-5 shadow-soft">
                                <CornerFlourish position="tl" />
                                <CornerFlourish position="br" />
                                {renderGarment(rendererId, {
                                    style: previewStyle,
                                    measurements: values,
                                    className: 'max-w-[250px] sm:max-w-xs mx-auto',
                                })}
                            </div>
                            <p className="font-accent italic text-body-sm text-warm-gray text-center mt-3">
                                Illustrative preview — not to scale
                            </p>
                        </div>
                    </div>
                    <div>
                        {useAgePrefill && (
                            <div className="mb-8 bg-blush/60 border border-champagne-gold/25 rounded-sm p-4">
                                <label className="label-caps block text-warm-gray">Your Age</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                    className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                                />
                                <p className="mt-2 text-body-sm text-warm-gray">
                                    We pre-fill typical measurements for your age — please adjust every value
                                    to your actual measurements for the best fit.{' '}
                                    <Link href="/measurement-guide" target="_blank" className="link-gold">
                                        Not sure how to measure?
                                    </Link>
                                </p>
                            </div>
                        )}
                        {spec.groups.map((group) => (
                            <MeasurementSliderGroup
                                key={group.key}
                                spec={spec}
                                group={group}
                                values={values}
                                styleAttrs={styleAttrs}
                                onChange={(key, v) => setValues((prev) => ({ ...prev, [key]: v }))}
                            />
                        ))}
                        <div className="mb-4">
                            <label className="label-caps block text-warm-gray">Colour</label>
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
                            placeholder="Fabric preferences, occasion, deadline..."
                        />
                    </div>
                </div>
            )}

            {/* Step 3: preview & submit */}
            {step === 2 && previewStyle && selected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div>
                        <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-6">
                            <CornerFlourish position="tl" />
                            <CornerFlourish position="br" />
                            <div ref={sketchRef}>
                                {renderGarment(rendererId, {
                                    style: previewStyle,
                                    measurements: values,
                                    className: 'max-w-sm mx-auto',
                                })}
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleGeneratePdf}
                            disabled={isGeneratingPdf}
                            className="w-full mt-5"
                        >
                            {isGeneratingPdf ? 'Preparing PDF…' : 'Download Design Sheet (PDF)'}
                        </Button>
                        <p className="text-caption text-warm-gray text-center mt-2">
                            The sketch, all measurements, and your choices — ready to share.
                        </p>
                        {pdfError && (
                            <p className="text-body-sm text-red-500 text-center mt-2" role="alert">{pdfError}</p>
                        )}
                        <MuseBoardPanel
                            files={museFiles}
                            note={museNote}
                            onFilesChange={setMuseFiles}
                            onNoteChange={setMuseNote}
                        />
                        {relatedPattern(selected?.slug) && (
                            <RelatedPatternCard listing={relatedPattern(selected?.slug)!} className="mt-6" />
                        )}
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
                                <dd className="text-charcoal text-right font-medium">
                                    {Object.entries(selected.styleAttributes)
                                        .filter(([k]) => k !== 'baseColor')
                                        .map(([, v]) => labelize(v))
                                        .join(' · ')}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Colour</dt>
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
                            Custom designs are individually quoted. Submit yours and the boutique will get
                            back to you with a price and next steps — no account needed.
                        </div>

                        {/* Signature block — the shared atelier signature moment. */}
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

export default SingleGarmentFlow;
