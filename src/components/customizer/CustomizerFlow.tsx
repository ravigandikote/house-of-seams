'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AtelierStepper from './AtelierStepper';
import BlousePreview from './BlousePreview';
import LehengaFlow from './LehengaFlow';
import LehengaPreview from './LehengaPreview';
import { SAMPLE_LEHENGA_DESIGNS } from './lehengaSamples';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import Button from '../ui/Button';
import { CornerFlourish, GoldDivider } from '../ui/decor';
import { LEHENGA_MEASUREMENT_SPEC } from '../../types/lehengaMeasurements';
import SelectField from '../ui/SelectField';
import TextArea from '../ui/TextArea';
import ToggleSwitch from '../ui/ToggleSwitch';
import { submitCustomDesignRequest } from '../../services/customizerService';
import { downloadBlouseDesignPdf } from '../../lib/blouseDesignPdf';
import { BlouseDesign } from '../../types/blouseDesign';
import {
    BlousePreferences,
    BLOUSE_OPENINGS,
    DEFAULT_PREFERENCES,
    FIT_PREFERENCES,
    SEAM_ALLOWANCES,
} from '../../types/customDesignRequest';
import { CUSTOMIZER_CATEGORIES } from '../../types/customizerCategories';
import {
    Measurements,
    MeasurementDefault,
    MeasurementField,
    BLOUSE_MEASUREMENT_SPEC,
    MEASUREMENT_FIELDS,
    MEASUREMENT_GROUPS,
    MEASUREMENT_LABELS,
    TYPICAL_MEASUREMENTS,
    bracketValue,
    findBracketForAge,
} from '../../types/measurements';

interface CustomizerFlowProps {
    designs: BlouseDesign[];
    brackets: MeasurementDefault[];
}

interface CustomizerFormValues extends Measurements {
    age: number;
    notes: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

const STEPS = ['Choose Design', 'Measurements', 'Preview & Submit'] as const;

// Poetic one-liners revealed on category-card hover.
const CATEGORY_POETRY: Record<string, string> = {
    blouse: 'Tailored to the last quarter-inch — your blouse, your story.',
    lehenga: 'Twirl-worthy gheras, stitched to your silhouette.',
    shirt: 'Joining the atelier soon.',
    trousers: 'Joining the atelier soon.',
};

// Used when no age bracket matches (or none are configured).
const BASE_MEASUREMENTS: Measurements = TYPICAL_MEASUREMENTS;

const DEFAULT_AGE = 25;

// "three-quarter" / "side-zip" -> "Three Quarter" / "Side Zip"
function labelize(value: string): string {
    return value
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function toMeasurements(values: CustomizerFormValues): Measurements {
    const result = {} as Measurements;
    for (const field of MEASUREMENT_FIELDS) {
        result[field] = Number(values[field]);
    }
    return result;
}

const CustomizerFlow: React.FC<CustomizerFlowProps> = ({ designs, brackets }) => {
    const [category, setCategory] = useState('blouse');
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState<BlouseDesign | null>(null);
    const [color, setColor] = useState('#D6A6B1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    // Short human-friendly reference from the created request (display only).
    const [reference, setReference] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<BlousePreferences>(DEFAULT_PREFERENCES);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    // Hidden front+back renders used as the PDF's image sources.
    const pdfRenderRef = useRef<HTMLDivElement>(null);

    const initialBracket = findBracketForAge(brackets, DEFAULT_AGE);
    const {
        register,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<CustomizerFormValues>({
        mode: 'onChange',
        defaultValues: {
            age: DEFAULT_AGE,
            notes: '',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            ...BASE_MEASUREMENTS,
            ...(initialBracket
                ? Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f, bracketValue(initialBracket, f)]))
                : {}),
        },
    });

    const values = watch();
    const measurements = toMeasurements(values);

    // Pre-fill measurements from the matching age bracket. Only re-applies
    // when the age moves into a DIFFERENT bracket, so it never stomps on
    // the customer's manual edits while they type within one bracket.
    const age = watch('age');
    const lastBracketId = useRef<string | null>(initialBracket?.id ?? null);
    useEffect(() => {
        const bracket = findBracketForAge(brackets, Number(age));
        if (bracket && bracket.id !== lastBracketId.current) {
            lastBracketId.current = bracket.id;
            for (const field of MEASUREMENT_FIELDS) {
                // bracketValue falls back to typical values when a bracket
                // predates a newly added measurement column.
                setValue(field, bracketValue(bracket, field), { shouldValidate: true });
            }
        }
    }, [age, brackets, setValue]);

    const selectDesign = (design: BlouseDesign) => {
        setSelected(design);
        setColor(design.baseColor);
    };

    const goNext = async () => {
        if (step === 1) {
            // Measurement values are slider-clamped and can't be invalid;
            // only the free-typed age needs checking.
            const valid = await trigger('age');
            if (!valid) return;
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const previewDesign = selected ? { ...selected, baseColor: color } : null;

    const handleGeneratePdf = async () => {
        if (!selected) return;
        const svgs = pdfRenderRef.current?.querySelectorAll('svg');
        if (!svgs || svgs.length < 2) return;
        setPdfError(null);
        setIsGeneratingPdf(true);
        try {
            await downloadBlouseDesignPdf(
                {
                    designName: selected.name,
                    design: { ...selected, baseColor: color },
                    color,
                    measurements,
                    preferences: { ...preferences, braSize: preferences.braSize?.trim() || null },
                    customerAge: Number(values.age) || null,
                    notes: values.notes || null,
                },
                svgs[0],
                svgs[1]
            );
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : 'Could not generate the PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleSubmit = async () => {
        if (!selected) return;
        const contactValid = await trigger(['customerName', 'customerEmail', 'customerPhone']);
        if (!contactValid) return;
        if (!values.customerEmail.trim() && !values.customerPhone.trim()) {
            setSubmitError('Please provide an email or phone number so the boutique can reach you.');
            return;
        }
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await submitCustomDesignRequest({
                // Fallback demo designs have non-UUID ids; the snapshot
                // carries the full design either way.
                designId: selected.id.startsWith('fallback-') ? null : selected.id,
                designSnapshot: {
                    name: selected.name,
                    slug: selected.slug,
                    neckStyle: selected.neckStyle,
                    backStyle: selected.backStyle,
                    sleeveStyle: selected.sleeveStyle,
                    closure: selected.closure,
                    embellishment: selected.embellishment,
                    baseColor: selected.baseColor,
                },
                measurements,
                selectedColor: color,
                customerAge: Number(values.age) || null,
                customerName: values.customerName,
                customerEmail: values.customerEmail || null,
                customerPhone: values.customerPhone || null,
                notes: values.notes || null,
                preferences: { ...preferences, braSize: preferences.braSize?.trim() || null },
            }).then((created) => {
                setReference(created.id ? created.id.slice(0, 8).toUpperCase() : null);
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Celebratory, refined confirmation
    if (submitted && previewDesign) {
        const nextSteps = [
            { title: 'We review', text: 'Our designer studies your sketch and measurements.' },
            { title: 'We reach out', text: 'You receive a personal quote and fabric suggestions.' },
            { title: 'We create', text: 'Your blouse is cut, stitched, and fitted to you.' },
        ];
        return (
            <div className="max-w-2xl mx-auto text-center py-8 animate-fade-in">
                <GoldDivider className="mb-8" />
                <p className="label-caps text-champagne-gold-dark mb-3">Request received</p>
                <h2 className="font-heading text-display-lg text-ink mb-3">
                    Beautifully done, {values.customerName.trim().split(' ')[0]}.
                </h2>
                <p className="font-accent italic text-lede text-warm-gray mb-2 max-w-md mx-auto">
                    Your design has been handed to the atelier.
                </p>
                {reference && (
                    <p className="text-body-sm text-warm-gray mb-6">
                        Reference <span className="font-medium text-ink tracking-widest">{reference}</span>
                    </p>
                )}
                <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-8 mb-10 max-w-xs mx-auto">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    <BlousePreview design={previewDesign} measurements={measurements} view="front" showCaption={false} />
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
                <div className="flex gap-6 justify-center">
                    <Link href="/products" className="link-gold text-body-sm">Browse Products</Link>
                    <Link href="/booking" className="link-gold text-body-sm">Book a Consultation</Link>
                </div>
            </div>
        );
    }

    // Compact pill switcher, used once the customer is inside a journey.
    const categoryPills = (
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {CUSTOMIZER_CATEGORIES.map((c) => (
                <button
                    key={c.id}
                    type="button"
                    disabled={!c.available}
                    title={c.description}
                    onClick={() => c.available && setCategory(c.id)}
                    className={`label-caps relative px-5 py-2.5 rounded-full border transition-colors duration-300 ${
                        c.id === category
                            ? 'bg-deep-rose border-deep-rose text-white'
                            : c.available
                                ? 'bg-ivory border-champagne-gold/40 text-charcoal hover:border-deep-rose hover:text-deep-rose'
                                : 'bg-ivory border-champagne-gold/20 text-warm-gray/60 cursor-not-allowed'
                    }`}
                >
                    {c.label}
                    {!c.available && (
                        <span className="ml-2 text-[9px] tracking-[0.14em] bg-blush text-warm-gray rounded-full px-2 py-0.5">
                            Coming soon
                        </span>
                    )}
                </button>
            ))}
        </div>
    );

    // Editorial category cards — the opening moment of the journey.
    const sketchDesign = designs[0] ?? {
        neckStyle: 'sweetheart' as const,
        backStyle: 'deep-round' as const,
        sleeveStyle: 'cap' as const,
        closure: 'zip' as const,
        embellishment: 'embroidery' as const,
        baseColor: '#B87A88',
    };
    const categoryCards = (
        <div className="mb-14">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">Begin with</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {CUSTOMIZER_CATEGORIES.map((c) => {
                    const isCurrent = c.id === category;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            disabled={!c.available}
                            onClick={() => c.available && setCategory(c.id)}
                            className={`group relative text-left rounded-sm border transition-all duration-300 overflow-hidden ${
                                isCurrent
                                    ? 'border-champagne-gold shadow-lift'
                                    : c.available
                                        ? 'border-champagne-gold/30 shadow-soft hover:shadow-lift hover:-translate-y-1'
                                        : 'border-champagne-gold/15 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <div className="relative paper-card p-5 h-44 flex items-center justify-center">
                                <CornerFlourish position="tl" />
                                {c.id === 'blouse' && (
                                    <BlousePreview
                                        design={sketchDesign}
                                        measurements={BASE_MEASUREMENTS}
                                        view="front"
                                        showCaption={false}
                                        className="max-w-[130px]"
                                    />
                                )}
                                {c.id === 'lehenga' && (
                                    <LehengaPreview
                                        styleAttributes={SAMPLE_LEHENGA_DESIGNS[0]}
                                        measurements={LEHENGA_MEASUREMENT_SPEC.typicalDefaults}
                                        className="max-w-[110px]"
                                    />
                                )}
                                {!c.available && (
                                    <span className="font-accent italic text-lede text-warm-gray/70">
                                        {c.label}
                                    </span>
                                )}
                            </div>
                            <div className="bg-white px-5 py-4 border-t border-champagne-gold/25">
                                <span className="font-heading text-title text-ink flex items-center justify-between">
                                    {c.label}
                                    {!c.available && (
                                        <span className="label-caps text-[9px] text-warm-gray/70">Coming soon</span>
                                    )}
                                </span>
                                <span className="font-accent italic text-body-sm text-warm-gray block mt-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                                    {CATEGORY_POETRY[c.id]}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const showEditorialCategories = step === 0;

    if (category === 'blouse' && designs.length === 0) {
        return (
            <div>
                {categoryCards}
                <p className="text-center text-warm-gray py-16">
                    The blouse customizer is being set up — please check back soon, or{' '}
                    <a href="/booking" className="link-gold">book a consultation</a>.
                </p>
            </div>
        );
    }

    if (category === 'lehenga') {
        return (
            <div>
                {categoryPills}
                <LehengaFlow />
            </div>
        );
    }

    return (
        <div>
            {showEditorialCategories ? categoryCards : categoryPills}

            <AtelierStepper steps={STEPS} current={step} />

            {/* Step 1: pick a design */}
            {step === 0 && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {designs.map((design) => {
                            const isSelected = selected?.id === design.id;
                            return (
                                <button
                                    key={design.id}
                                    type="button"
                                    onClick={() => selectDesign(design)}
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
                                            measurements={BASE_MEASUREMENTS}
                                            view="front"
                                            showCaption={false}
                                        />
                                    </div>
                                    <div className="p-5 border-t border-champagne-gold/25">
                                        <h3 className="font-heading text-title text-ink">{design.name}</h3>
                                        {design.description && (
                                            <p className="font-accent italic text-body-sm text-warm-gray mt-1.5">
                                                {design.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {[design.neckStyle, design.sleeveStyle, design.embellishment].map((attr) => (
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
                </div>
            )}

            {/* Step 2: measurements */}
            {step === 1 && previewDesign && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div>
                        <div className="mb-8 bg-blush/60 border border-champagne-gold/25 rounded-sm p-4">
                            <label className="label-caps block text-warm-gray">Your Age</label>
                            <input
                                type="number"
                                {...register('age', { valueAsNumber: true, min: 1, max: 120 })}
                                className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                            />
                            <p className="mt-2 text-body-sm text-warm-gray">
                                We pre-fill typical measurements for your age — please adjust every value to your
                                actual measurements for the best fit.{' '}
                                <Link href="/measurement-guide" target="_blank" className="link-gold">
                                    Not sure how to measure?
                                </Link>
                            </p>
                        </div>

                        {/* Slider editor: every measurement is a slider paired with
                            an exact numeric input; values are always in-range so no
                            per-field validation errors are possible here. */}
                        {BLOUSE_MEASUREMENT_SPEC.groups.map((group) => (
                            <MeasurementSliderGroup
                                key={group.key}
                                spec={BLOUSE_MEASUREMENT_SPEC}
                                group={group}
                                values={measurements}
                                styleAttrs={{}}
                                onChange={(key, v) =>
                                    setValue(key as MeasurementField, v, { shouldValidate: false })
                                }
                            />
                        ))}

                        <div className="border-b border-champagne-gold/40 pb-2 mb-4">
                            <span className="label-caps text-champagne-gold-dark">Additional Details</span>
                        </div>
                        <SelectField
                            label="Blouse Opening"
                            value={preferences.blouseOpening}
                            onChange={(e) =>
                                setPreferences({ ...preferences, blouseOpening: e.target.value as BlousePreferences['blouseOpening'] })
                            }
                            options={BLOUSE_OPENINGS.map((o) => ({ value: o, label: labelize(o) }))}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <SelectField
                                label="Fit Preference"
                                value={preferences.fitPreference}
                                onChange={(e) =>
                                    setPreferences({ ...preferences, fitPreference: e.target.value as BlousePreferences['fitPreference'] })
                                }
                                options={FIT_PREFERENCES.map((f) => ({ value: f, label: labelize(f) }))}
                            />
                            <SelectField
                                label="Seam Allowance"
                                value={preferences.seamAllowance}
                                onChange={(e) =>
                                    setPreferences({ ...preferences, seamAllowance: e.target.value as BlousePreferences['seamAllowance'] })
                                }
                                options={SEAM_ALLOWANCES.map((s) => ({
                                    value: s,
                                    label: s === 'extra' ? 'Extra (room for future alterations)' : 'Standard',
                                }))}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="label-caps block text-warm-gray">
                                Bra / Inner-wear Size (optional)
                            </label>
                            <input
                                type="text"
                                value={preferences.braSize ?? ''}
                                onChange={(e) => setPreferences({ ...preferences, braSize: e.target.value })}
                                placeholder="e.g. 34B"
                                className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
                            />
                        </div>
                        <ToggleSwitch
                            label="Cup padding"
                            checked={preferences.cupPadding}
                            onChange={(checked) => setPreferences({ ...preferences, cupPadding: checked })}
                        />

                        <div className="mb-4">
                            <label className="label-caps block text-warm-gray">Blouse Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="mt-1.5 block w-full h-11 rounded-sm !p-1"
                            />
                        </div>

                        <TextArea
                            label="Notes for the boutique (optional)"
                            value={values.notes}
                            onChange={(e) => setValue('notes', e.target.value)}
                            rows={3}
                            placeholder="Fabric preferences, lining, occasion, deadline..."
                        />
                    </div>

                    <div>
                        <div className="md:sticky md:top-20">
                            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Sketchbook</p>
                            <div className="flex flex-col gap-5">
                                {(['front', 'back'] as const).map((v) => (
                                    <div
                                        key={v}
                                        className="relative paper-card border border-champagne-gold/40 rounded-sm p-5 w-full max-w-[360px] mx-auto transition-shadow duration-500"
                                    >
                                        <CornerFlourish position="tl" />
                                        <CornerFlourish position="br" />
                                        <BlousePreview
                                            design={previewDesign}
                                            measurements={measurements}
                                            view={v}
                                            showCaption={false}
                                        />
                                        <p className="font-accent italic text-body-sm text-warm-gray text-center mt-1">
                                            {v === 'front' ? 'Front' : 'Back'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {/* Key numbers, annotated like a designer's spec sheet */}
                            <div className="flex justify-center gap-5 mt-4 flex-wrap">
                                {([
                                    ['Bust', measurements.bust],
                                    ['Waist', measurements.waist],
                                    ['Length', measurements.blouseLength],
                                    ['Sleeve', measurements.sleeveLength],
                                ] as const).map(([label, num]) => (
                                    <div key={label} className="text-center">
                                        <p className="label-caps text-[9px] text-warm-gray">{label}</p>
                                        <p className="text-body text-ink tabular-nums">{num}&Prime;</p>
                                    </div>
                                ))}
                            </div>
                            <p className="font-accent italic text-body-sm text-warm-gray text-center mt-3">
                                Illustrative preview — not to scale
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: preview & review */}
            {step === 2 && previewDesign && selected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div>
                        {/* Both views shown together; this container is also the
                            PDF's image source (front svg first, back svg second). */}
                        <div ref={pdfRenderRef} className="flex flex-col gap-5">
                            {(['front', 'back'] as const).map((v) => (
                                <div
                                    key={v}
                                    className="relative paper-card border border-champagne-gold/40 rounded-sm p-6 w-full max-w-md mx-auto"
                                >
                                    <CornerFlourish position="tl" />
                                    <CornerFlourish position="br" />
                                    <BlousePreview
                                        design={previewDesign}
                                        measurements={measurements}
                                        view={v}
                                        showCaption={false}
                                    />
                                    <p className="font-accent italic text-body-sm text-warm-gray text-center mt-1">
                                        {v === 'front' ? 'Front' : 'Back'}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="font-accent italic text-body-sm text-warm-gray text-center mt-3">
                            Illustrative preview — not to scale
                        </p>

                        <Button
                            variant="secondary"
                            onClick={handleGeneratePdf}
                            disabled={isGeneratingPdf}
                            className="w-full mt-5"
                        >
                            {isGeneratingPdf ? 'Preparing PDF…' : 'Download Design Sheet (PDF)'}
                        </Button>
                        <p className="text-caption text-warm-gray text-center mt-2">
                            Both views, all measurements, and your choices — ready to share.
                        </p>
                        {pdfError && (
                            <p className="text-body-sm text-red-500 text-center mt-2" role="alert">{pdfError}</p>
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
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Opening / Fit / Seams</dt>
                                <dd className="text-charcoal text-right">
                                    {labelize(preferences.blouseOpening)} · {labelize(preferences.fitPreference)} ·{' '}
                                    {labelize(preferences.seamAllowance)}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                <dt className="text-warm-gray">Cup Padding / Inner-wear</dt>
                                <dd className="text-charcoal text-right">
                                    {preferences.cupPadding ? 'Yes' : 'No'}
                                    {preferences.braSize?.trim() ? ` · ${preferences.braSize.trim()}` : ''}
                                </dd>
                            </div>
                            {MEASUREMENT_GROUPS.map((group) => (
                                <React.Fragment key={group.id}>
                                    <div className="pt-3">
                                        <dt className="label-caps text-champagne-gold-dark">{group.label}</dt>
                                    </div>
                                    {group.fields.map((field) => (
                                        <div key={field} className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                            <dt className="text-warm-gray">{MEASUREMENT_LABELS[field]}</dt>
                                            <dd className="text-ink tabular-nums">{measurements[field]}&Prime;</dd>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                            {values.notes && (
                                <div className="pt-2">
                                    <dt className="text-warm-gray mb-1">Notes</dt>
                                    <dd className="text-charcoal">{values.notes}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-6 bg-blush/60 border border-champagne-gold/25 rounded-sm p-4 text-body-sm text-charcoal">
                            Custom blouses are individually quoted. Submit your design and the boutique will get
                            back to you with a price and next steps — no account needed.
                        </div>

                        {/* Signature block. Contact fields use raw inputs: the shared
                            ui/Input is not forwardRef-compatible, so react-hook-form's
                            register ref would be silently dropped. */}
                        <div className="mt-6 border border-champagne-gold/40 rounded-sm p-5 relative">
                            <CornerFlourish position="tr" />
                            <p className="font-accent italic text-lede text-ink mb-4">Signed for the atelier by…</p>
                            <div className="mb-4">
                                <label className="label-caps block text-warm-gray">Your Name</label>
                                <input
                                    type="text"
                                    {...register('customerName', { required: true })}
                                    className={`mt-1.5 block w-full rounded-sm px-3 py-2.5 ${errors.customerName ? '!border-red-400' : ''}`}
                                />
                                {errors.customerName && (
                                    <p className="mt-1 text-caption text-red-500">Please enter your name</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <div className="mb-4">
                                    <label className="label-caps block text-warm-gray">Email</label>
                                    <input
                                        type="email"
                                        {...register('customerEmail', {
                                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        })}
                                        className={`mt-1.5 block w-full rounded-sm px-3 py-2.5 ${errors.customerEmail ? '!border-red-400' : ''}`}
                                    />
                                    {errors.customerEmail && (
                                        <p className="mt-1 text-caption text-red-500">Please enter a valid email</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="label-caps block text-warm-gray">Phone</label>
                                    <input
                                        type="tel"
                                        {...register('customerPhone', {
                                            pattern: /^[0-9+\-() ]{7,15}$/,
                                        })}
                                        className={`mt-1.5 block w-full rounded-sm px-3 py-2.5 ${errors.customerPhone ? '!border-red-400' : ''}`}
                                    />
                                    {errors.customerPhone && (
                                        <p className="mt-1 text-caption text-red-500">Please enter a valid phone number</p>
                                    )}
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
                <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} className={step === 0 ? 'invisible' : ''}>
                    Back
                </Button>
                {step < STEPS.length - 1 && (
                    <Button onClick={goNext} disabled={!selected}>
                        {step === 0 ? (selected ? 'Continue' : 'Select a design') : 'Preview'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CustomizerFlow;
