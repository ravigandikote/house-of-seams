'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import AtelierStepper from './AtelierStepper';
import Button from '../ui/Button';
import BlousePreview from './BlousePreview';
import LehengaEnsemblePreview from './LehengaEnsemblePreview';
import LehengaPreview from './LehengaPreview';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import MuseBoardPanel from './MuseBoardPanel';
import TextArea from '../ui/TextArea';
import ToggleSwitch from '../ui/ToggleSwitch';
import { CornerFlourish, GoldDivider } from '../ui/decor';
import { downloadGarmentDesignPdf } from '../../lib/garmentDesignPdf';
import { submitCustomDesignRequest } from '../../services/customizerService';
import { BlouseDesign } from '../../types/blouseDesign';
import { GarmentDesign } from '../../types/garmentDesign';
import { LehengaDesignAttributes } from '../../types/lehengaDesign';
import { LEHENGA_MEASUREMENT_SPEC } from '../../types/lehengaMeasurements';
import {
    BLOUSE_MEASUREMENT_SPEC,
    Measurements,
    TYPICAL_MEASUREMENTS,
} from '../../types/measurements';

// The lehenga ensemble journey: skirt design → choli (or proudly skirt
// only) → measurements for every chosen garment → composed preview &
// submit. The choli IS a blouse — same designs, spec, and renderer, with
// ensemble labels. Requests flow through the shared pipeline
// (category: 'lehenga'); the dupatta choice rides in preferences.

const STEPS = ['Choose Skirt', 'Choose Choli', 'Measurements', 'Preview & Submit'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,15}$/;

// A garment_designs row narrowed to what the skirt journey needs.
interface SkirtDesign {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    designerNote?: string | null;
    isSignature: boolean;
    attrs: LehengaDesignAttributes;
}

function toSkirtDesign(d: GarmentDesign): SkirtDesign {
    return {
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description,
        designerNote: d.designerNote,
        isSignature: d.isSignature,
        attrs: d.styleAttributes as unknown as LehengaDesignAttributes,
    };
}

interface LehengaFlowProps {
    /** Blouse designs — choli options reuse them wholesale. */
    cholis: BlouseDesign[];
    /** Skirt designs from garment_designs (category: lehenga). */
    skirts: GarmentDesign[];
}

const LehengaFlow: React.FC<LehengaFlowProps> = ({ cholis, skirts }) => {
    const skirtDesigns = skirts.map(toSkirtDesign);
    const [step, setStep] = useState(0);
    const [skirt, setSkirt] = useState<SkirtDesign | null>(null);
    const [skirtColor, setSkirtColor] = useState('#D6A6B1');
    // null = undecided; 'skirt-only' is a first-class choice.
    const [choli, setCholi] = useState<BlouseDesign | 'skirt-only' | null>(null);
    const [choliColor, setCholiColor] = useState('#D6A6B1');
    const [dupatta, setDupatta] = useState(false);
    const [skirtValues, setSkirtValues] = useState<Record<string, number>>({
        ...LEHENGA_MEASUREMENT_SPEC.typicalDefaults,
    });
    const [choliValues, setCholiValues] = useState<Record<string, number>>({
        ...TYPICAL_MEASUREMENTS,
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
    const [museFiles, setMuseFiles] = useState<File[]>([]);
    const [museNote, setMuseNote] = useState('');
    const [museWarning, setMuseWarning] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const sketchRef = useRef<HTMLDivElement>(null);

    const hasCholi = choli !== null && choli !== 'skirt-only';
    const choliDesign = hasCholi ? (choli as BlouseDesign) : null;
    const previewSkirt = skirt ? { ...skirt.attrs, baseColor: skirtColor } : null;
    const previewCholi = choliDesign ? { ...choliDesign, baseColor: choliColor } : null;
    const styleAttrs: Record<string, string> = skirt
        ? { silhouette: skirt.attrs.silhouette, closure: skirt.attrs.closure, embellishment: skirt.attrs.embellishment }
        : {};
    const visibleSkirtFields = LEHENGA_MEASUREMENT_SPEC.fields.filter(
        (f) => !f.visibleWhen || f.visibleWhen(styleAttrs)
    );
    // Combined record for the ensemble preview + submit (no key overlap).
    const combinedMeasurements = { ...skirtValues, ...(hasCholi ? choliValues : {}) };

    const handleSubmit = async () => {
        if (!skirt) return;
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
            const measurements = {
                ...Object.fromEntries(visibleSkirtFields.map((f) => [f.key, skirtValues[f.key]])),
                ...(hasCholi ? choliValues : {}),
            };
            const created = await submitCustomDesignRequest({
                category: 'lehenga',
                designId: null,
                designSnapshot: {
                    name: skirt.name,
                    slug: skirt.slug,
                    silhouette: skirt.attrs.silhouette,
                    closure: skirt.attrs.closure,
                    embellishment: skirt.attrs.embellishment,
                    baseColor: skirt.attrs.baseColor,
                    choli: choliDesign
                        ? {
                              name: choliDesign.name,
                              slug: choliDesign.slug,
                              neckStyle: choliDesign.neckStyle,
                              backStyle: choliDesign.backStyle,
                              sleeveStyle: choliDesign.sleeveStyle,
                              closure: choliDesign.closure,
                              embellishment: choliDesign.embellishment,
                              baseColor: choliColor,
                          }
                        : null,
                },
                measurements: measurements as unknown as Measurements,
                selectedColor: skirtColor,
                customerAge: null,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                notes: notes || null,
                preferences: { dupatta },
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
        if (!skirt || !sketchRef.current) return;
        setPdfError(null);
        setIsGeneratingPdf(true);
        try {
            const rows = [
                ...(hasCholi
                    ? BLOUSE_MEASUREMENT_SPEC.fields.map((f) => ({
                          group: `Choli · ${BLOUSE_MEASUREMENT_SPEC.groups.find((g) => g.key === f.group)?.label ?? ''}`,
                          label: f.label,
                          value: `${choliValues[f.key]}"`,
                      }))
                    : []),
                ...visibleSkirtFields.map((f) => ({
                    group: `Skirt · ${LEHENGA_MEASUREMENT_SPEC.groups.find((g) => g.key === f.group)?.label ?? ''}`,
                    label: f.label,
                    value: `${skirtValues[f.key]}${f.unit === 'in' ? '"' : ''}`,
                })),
            ];
            await downloadGarmentDesignPdf(
                {
                    categoryLabel: 'Lehenga Ensemble',
                    designName: hasCholi
                        ? `${skirt.name} + ${(choli as BlouseDesign).name} choli`
                        : skirt.name,
                    styleLine:
                        `${skirt.attrs.silhouette.replace(/_/g, ' ')} silhouette  ·  ` +
                        `${skirt.attrs.embellishment}  ·  Skirt colour ${skirtColor}` +
                        (hasCholi ? `  ·  Choli colour ${choliColor}` : ''),
                    ensembleLine: `${hasCholi ? 'With choli' : 'Skirt only'}${dupatta ? '  ·  with matching dupatta' : ''}`,
                    rows,
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

    // Celebratory confirmation — mirrors the blouse journey.
    if (submitted && previewSkirt) {
        const nextSteps = [
            { title: 'We review', text: 'Our designer studies your sketch and measurements.' },
            { title: 'We reach out', text: 'You receive a personal quote and fabric suggestions.' },
            { title: 'We create', text: 'Your ensemble is cut, stitched, and fitted to you.' },
        ];
        return (
            <div className="max-w-2xl mx-auto text-center py-8 animate-fade-in">
                <GoldDivider className="mb-8" />
                <p className="label-caps text-champagne-gold-dark mb-3">Request received</p>
                <h2 className="font-heading text-display-lg text-ink mb-3">
                    Beautifully done, {customerName.trim().split(' ')[0]}.
                </h2>
                <p className="font-accent italic text-lede text-warm-gray mb-2 max-w-md mx-auto">
                    Your {hasCholi ? 'ensemble has' : 'lehenga has'} been handed to the atelier.
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
                            Your private journal — watch your lehenga move from sketch to stitching,
                            and share the page with anyone you love.
                        </p>
                    </div>
                )}
                <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-8 mb-10 max-w-xs mx-auto">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    <LehengaEnsemblePreview
                        skirt={previewSkirt}
                        choli={previewCholi}
                        dupatta={dupatta}
                        measurements={combinedMeasurements}
                    />
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

    const canAdvance =
        step === 0 ? !!skirt : step === 1 ? choli !== null : true;

    return (
        <div>
            <AtelierStepper steps={STEPS} current={step} />

            {/* Step 1: pick a skirt design */}
            {step === 0 && (
                <div className="animate-fade-in">
                    {skirtDesigns.length === 0 && (
                        <p className="text-center text-warm-gray py-16">
                            The lehenga atelier is being stocked — please check back soon, or{' '}
                            <Link href="/booking" className="link-gold">book a consultation</Link>.
                        </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {skirtDesigns.map((design) => {
                            const isSelected = skirt?.id === design.id;
                            return (
                                <button
                                    key={design.id}
                                    type="button"
                                    onClick={() => {
                                        setSkirt(design);
                                        setSkirtColor(design.attrs.baseColor);
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
                                        {design.isSignature && (
                                            <span className="absolute top-2 right-2 label-caps text-[9px] text-champagne-gold-dark">
                                                ★ Signature
                                            </span>
                                        )}
                                        <LehengaPreview
                                            styleAttributes={design.attrs}
                                            measurements={LEHENGA_MEASUREMENT_SPEC.typicalDefaults}
                                        />
                                    </div>
                                    <div className="p-5 border-t border-champagne-gold/25">
                                        <h3 className="font-heading text-title text-ink">{design.name}</h3>
                                        {design.description && (
                                            <p className="font-accent italic text-body-sm text-warm-gray mt-1.5">{design.description}</p>
                                        )}
                                        {design.designerNote && (
                                            <p className="text-caption text-champagne-gold-dark mt-2">
                                                — {design.designerNote}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {[design.attrs.silhouette, design.attrs.embellishment].map((attr) => (
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
                </div>
            )}

            {/* Step 2: pick a choli — or proudly skirt only */}
            {step === 1 && (
                <div className="animate-fade-in">
                    <p className="font-accent italic text-lede text-warm-gray text-center mb-6 max-w-md mx-auto">
                        Every choli here is cut from our blouse patterns — pick one, or keep the
                        stage for your skirt alone.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Skirt only — a first-class choice */}
                        <button
                            type="button"
                            onClick={() => setCholi('skirt-only')}
                            className={`text-left bg-white rounded-sm overflow-hidden transition-all duration-300 border ${
                                choli === 'skirt-only'
                                    ? 'border-champagne-gold ring-1 ring-champagne-gold shadow-lift scale-[1.015]'
                                    : 'border-champagne-gold/25 shadow-soft hover:shadow-lift hover:-translate-y-1'
                            }`}
                        >
                            <div className="relative paper-card p-3 h-48 flex items-center justify-center">
                                <CornerFlourish position="tl" />
                                {choli === 'skirt-only' && <CornerFlourish position="br" />}
                                <span className="font-accent italic text-lede text-warm-gray text-center px-4">
                                    Skirt only —<br />I have my own top
                                </span>
                            </div>
                            <div className="p-5 border-t border-champagne-gold/25">
                                <h3 className="font-heading text-title text-ink">Skirt Only</h3>
                                <p className="font-accent italic text-body-sm text-warm-gray mt-1.5">
                                    We tailor the lehenga; you style the rest.
                                </p>
                            </div>
                        </button>
                        {cholis.map((design) => {
                            const isSelected = hasCholi && (choli as BlouseDesign).id === design.id;
                            return (
                                <button
                                    key={design.id}
                                    type="button"
                                    onClick={() => {
                                        setCholi(design);
                                        setCholiColor(design.baseColor);
                                    }}
                                    className={`text-left bg-white rounded-sm overflow-hidden transition-all duration-300 border ${
                                        isSelected
                                            ? 'border-champagne-gold ring-1 ring-champagne-gold shadow-lift scale-[1.015]'
                                            : 'border-champagne-gold/25 shadow-soft hover:shadow-lift hover:-translate-y-1'
                                    }`}
                                >
                                    <div className="relative paper-card p-4">
                                        <CornerFlourish position="tl" />
                                        {isSelected && <CornerFlourish position="br" />}
                                        <BlousePreview
                                            design={design}
                                            measurements={TYPICAL_MEASUREMENTS}
                                            view="front"
                                            showCaption={false}
                                        />
                                    </div>
                                    <div className="p-5 border-t border-champagne-gold/25">
                                        <h3 className="font-heading text-title text-ink">{design.name}</h3>
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {[design.neckStyle, design.sleeveStyle].map((attr) => (
                                                <span
                                                    key={attr}
                                                    className="label-caps text-[9px] text-champagne-gold-dark bg-ivory border border-champagne-gold/30 rounded-full px-2.5 py-1"
                                                >
                                                    {attr.replace(/[-_]/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step 3: measurements for every chosen garment */}
            {step === 2 && previewSkirt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="order-first md:order-last">
                        <div className="sticky top-2 md:top-24 z-10">
                            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Sketchbook</p>
                            <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-5 shadow-soft">
                                <CornerFlourish position="tl" />
                                <CornerFlourish position="br" />
                                <LehengaEnsemblePreview
                                    skirt={previewSkirt}
                                    choli={previewCholi}
                                    dupatta={dupatta}
                                    measurements={combinedMeasurements}
                                    className="max-w-[240px] sm:max-w-xs mx-auto"
                                />
                            </div>
                            <div className="flex justify-center gap-5 mt-4 flex-wrap">
                                {([
                                    ...(hasCholi ? ([['Bust', combinedMeasurements.bust]] as const) : []),
                                    ['Waist', skirtValues.waistRound],
                                    ['Hip', skirtValues.hipRound],
                                    ['Length', skirtValues.lehengaLength],
                                    ['Ghera', skirtValues.flareGhera],
                                ] as readonly (readonly [string, number])[]).map(([label, num]) => (
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
                            All values in inches — drag a slider or type an exact value. Our{' '}
                            <Link href="/measurement-guide" target="_blank" className="link-gold">
                                measurement guide
                            </Link>{' '}
                            shows how each one is taken.
                        </p>

                        {hasCholi && (
                            <>
                                <div className="border-b border-champagne-gold/40 pb-2 mb-4">
                                    <span className="label-caps text-champagne-gold-dark">The Choli</span>
                                </div>
                                {BLOUSE_MEASUREMENT_SPEC.groups.map((group) => (
                                    <MeasurementSliderGroup
                                        key={`choli-${group.key}`}
                                        spec={BLOUSE_MEASUREMENT_SPEC}
                                        group={group}
                                        values={choliValues}
                                        styleAttrs={{}}
                                        onChange={(key, v) => setCholiValues((prev) => ({ ...prev, [key]: v }))}
                                    />
                                ))}
                                <div className="mb-6">
                                    <label className="label-caps block text-warm-gray">Choli Color</label>
                                    <input
                                        type="color"
                                        value={choliColor}
                                        onChange={(e) => setCholiColor(e.target.value)}
                                        className="mt-1.5 block w-full h-11 rounded-sm !p-1"
                                    />
                                </div>
                            </>
                        )}

                        <div className="border-b border-champagne-gold/40 pb-2 mb-4">
                            <span className="label-caps text-champagne-gold-dark">The Skirt</span>
                        </div>
                        {LEHENGA_MEASUREMENT_SPEC.groups.map((group) => (
                            <MeasurementSliderGroup
                                key={group.key}
                                spec={LEHENGA_MEASUREMENT_SPEC}
                                group={group}
                                values={skirtValues}
                                styleAttrs={styleAttrs}
                                onChange={(key, v) => setSkirtValues((prev) => ({ ...prev, [key]: v }))}
                            />
                        ))}
                        <div className="mb-6">
                            <label className="label-caps block text-warm-gray">Skirt Color</label>
                            <input
                                type="color"
                                value={skirtColor}
                                onChange={(e) => setSkirtColor(e.target.value)}
                                className="mt-1.5 block w-full h-11 rounded-sm !p-1"
                            />
                        </div>

                        <div className="mb-4 bg-blush/60 border border-champagne-gold/25 rounded-sm p-4">
                            <ToggleSwitch
                                label="Add a matching dupatta"
                                checked={dupatta}
                                onChange={setDupatta}
                            />
                            <p className="text-caption text-warm-gray mt-1.5">
                                Standard drape · about 2.5 metres, matched to your ensemble by the boutique.
                            </p>
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

            {/* Step 4: preview & submit */}
            {step === 3 && previewSkirt && skirt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div>
                        <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-6">
                            <CornerFlourish position="tl" />
                            <CornerFlourish position="br" />
                            <div ref={sketchRef}>
                                <LehengaEnsemblePreview
                                    skirt={previewSkirt}
                                    choli={previewCholi}
                                    dupatta={dupatta}
                                    measurements={combinedMeasurements}
                                    className="max-w-sm mx-auto"
                                />
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
                            The ensemble sketch, all measurements, and your choices — ready to share.
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
                    </div>
                    <div>
                        <p className="label-caps text-champagne-gold-dark mb-1.5">The Design Sheet</p>
                        <h3 className="font-heading text-headline text-ink mb-1">
                            {skirt.name}
                            {hasCholi ? ` + ${(choli as BlouseDesign).name} choli` : ''}
                        </h3>
                        <p className="font-accent italic text-body text-warm-gray mb-5">
                            Every number below was set by your hand.
                        </p>
                        <dl className="space-y-2 text-body-sm">
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Ensemble</dt>
                                <dd className="text-charcoal text-right font-medium">
                                    {skirt.name}
                                    {hasCholi ? ` · ${(choli as BlouseDesign).name}` : ' · skirt only'}
                                    {dupatta ? ' · dupatta' : ''}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Colours</dt>
                                <dd className="flex items-center gap-2">
                                    <span
                                        className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: skirtColor }}
                                    />
                                    {hasCholi && (
                                        <span
                                            className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: choliColor }}
                                        />
                                    )}
                                </dd>
                            </div>
                            {hasCholi && (
                                <>
                                    <div className="pt-3">
                                        <dt className="label-caps text-champagne-gold-dark">The Choli</dt>
                                    </div>
                                    {BLOUSE_MEASUREMENT_SPEC.fields.map((f) => (
                                        <div key={f.key} className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                            <dt className="text-warm-gray">{f.label}</dt>
                                            <dd className="text-charcoal">{choliValues[f.key]}″</dd>
                                        </div>
                                    ))}
                                </>
                            )}
                            <div className="pt-3">
                                <dt className="label-caps text-champagne-gold-dark">The Skirt</dt>
                            </div>
                            {visibleSkirtFields.map((f) => (
                                <div key={f.key} className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                    <dt className="text-warm-gray">{f.label}</dt>
                                    <dd className="text-charcoal">
                                        {skirtValues[f.key]}
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
                            Custom ensembles are individually quoted. Submit your design and the boutique will
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
                    <Button onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))} disabled={!canAdvance}>
                        {step === 0
                            ? (skirt ? 'Continue' : 'Select a skirt')
                            : step === 1
                                ? (choli !== null ? 'Continue' : 'Choose or skip')
                                : 'Preview'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default LehengaFlow;
