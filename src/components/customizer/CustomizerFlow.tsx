'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import BlousePreview from './BlousePreview';
import LehengaFlow from './LehengaFlow';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import Button from '../ui/Button';
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

const STEPS = ['Design', 'Measurements', 'Preview'] as const;

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
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirmation screen (mirrors checkout/success styling)
    if (submitted && previewDesign) {
        return (
            <div className="max-w-lg mx-auto text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="font-heading text-3xl font-bold text-charcoal mb-2">Request Received!</h2>
                <p className="text-warm-gray mb-6">
                    Thank you, {values.customerName.trim()}. The boutique will review your design and get back
                    to you with a quote and next steps.
                </p>
                <div className="bg-cream rounded-lg p-6 mb-6">
                    <BlousePreview design={previewDesign} measurements={measurements} view="front" className="max-w-[220px] mx-auto" />
                </div>
                <div className="flex gap-3 justify-center">
                    <Link href="/products" className="text-dusty-rose hover:underline font-medium">Browse Products</Link>
                    <Link href="/booking" className="text-dusty-rose hover:underline font-medium">Book a Consultation</Link>
                </div>
            </div>
        );
    }

    const categoryPills = (
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {CUSTOMIZER_CATEGORIES.map((c) => (
                <button
                    key={c.id}
                    type="button"
                    disabled={!c.available}
                    title={c.description}
                    onClick={() => c.available && setCategory(c.id)}
                    className={`relative px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        c.id === category
                            ? 'bg-dusty-rose border-dusty-rose text-white'
                            : c.available
                                ? 'bg-white border-gray-300 text-gray-700 hover:border-dusty-rose'
                                : 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {c.label}
                    {!c.available && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                            Coming soon
                        </span>
                    )}
                </button>
            ))}
        </div>
    );

    if (category === 'blouse' && designs.length === 0) {
        return (
            <div>
                {categoryPills}
                <p className="text-center text-warm-gray py-16">
                    The blouse customizer is being set up — please check back soon, or{' '}
                    <a href="/booking" className="text-dusty-rose underline">book a consultation</a>.
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
            {categoryPills}

            {/* Stepper */}
            <ol className="flex items-center justify-center gap-2 sm:gap-6 mb-10">
                {STEPS.map((label, i) => (
                    <li key={label} className="flex items-center gap-2 sm:gap-3">
                        <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                i < step
                                    ? 'bg-sage-green text-white'
                                    : i === step
                                        ? 'bg-dusty-rose text-white'
                                        : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                            {i < step ? '✓' : i + 1}
                        </span>
                        <span className={`text-sm font-medium ${i === step ? 'text-charcoal' : 'text-warm-gray'}`}>
                            {label}
                        </span>
                        {i < STEPS.length - 1 && <span className="w-6 sm:w-12 h-px bg-gray-300" />}
                    </li>
                ))}
            </ol>

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
                                    className={`text-left bg-white rounded-lg shadow-sm border transition-all duration-200 overflow-hidden hover:shadow-md ${
                                        isSelected ? 'border-dusty-rose ring-2 ring-dusty-rose' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="bg-cream p-4">
                                        <BlousePreview
                                            design={design}
                                            measurements={BASE_MEASUREMENTS}
                                            view="front"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-heading text-lg font-bold text-charcoal">{design.name}</h3>
                                        {design.description && (
                                            <p className="text-sm text-warm-gray mt-1">{design.description}</p>
                                        )}
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
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700">Your Age</label>
                            <input
                                type="number"
                                {...register('age', { valueAsNumber: true, min: 1, max: 120 })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                            />
                            <p className="mt-1 text-xs text-warm-gray">
                                We pre-fill typical measurements for your age — please adjust every value to your
                                actual measurements for the best fit.{' '}
                                <Link href="/measurement-guide" target="_blank" className="text-dusty-rose underline">
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

                        <h3 className="font-heading text-base font-bold text-charcoal border-b border-dusty-rose/40 pb-1 mb-3">
                            Additional Details
                        </h3>
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
                            <label className="block text-sm font-medium text-gray-700">
                                Bra / Inner-wear Size (optional)
                            </label>
                            <input
                                type="text"
                                value={preferences.braSize ?? ''}
                                onChange={(e) => setPreferences({ ...preferences, braSize: e.target.value })}
                                placeholder="e.g. 34B"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                            />
                        </div>
                        <ToggleSwitch
                            label="Cup padding"
                            checked={preferences.cupPadding}
                            onChange={(checked) => setPreferences({ ...preferences, cupPadding: checked })}
                        />

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Blouse Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
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
                        <p className="text-sm font-medium text-gray-700 mb-2 text-center">Live preview</p>
                        <div className="md:sticky md:top-20">
                            <div className="flex flex-col gap-4">
                                {(['front', 'back'] as const).map((v) => (
                                    <div key={v} className="bg-cream rounded-lg p-4 w-full max-w-[360px] mx-auto">
                                        <BlousePreview
                                            design={previewDesign}
                                            measurements={measurements}
                                            view={v}
                                            showCaption={false}
                                        />
                                        <p className="text-center text-sm text-warm-gray mt-1">
                                            {v === 'front' ? 'Front' : 'Back'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-warm-gray italic text-center mt-2">
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
                        <div ref={pdfRenderRef} className="flex flex-col gap-4">
                            {(['front', 'back'] as const).map((v) => (
                                <div key={v} className="bg-cream rounded-lg p-5 w-full max-w-md mx-auto">
                                    <BlousePreview
                                        design={previewDesign}
                                        measurements={measurements}
                                        view={v}
                                        showCaption={false}
                                    />
                                    <p className="text-center text-sm text-warm-gray mt-1">
                                        {v === 'front' ? 'Front' : 'Back'}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-warm-gray italic text-center mt-2">
                            Illustrative preview — not to scale
                        </p>

                        <Button
                            variant="outline"
                            onClick={handleGeneratePdf}
                            disabled={isGeneratingPdf}
                            className="w-full mt-4"
                        >
                            {isGeneratingPdf ? 'Preparing PDF…' : 'Generate PDF'}
                        </Button>
                        <p className="text-xs text-warm-gray text-center mt-2">
                            Downloads a design sheet with both views, all measurements, and your choices.
                        </p>
                        {pdfError && (
                            <p className="text-sm text-red-500 text-center mt-2" role="alert">{pdfError}</p>
                        )}
                    </div>

                    <div>
                        <h3 className="font-heading text-xl font-bold text-charcoal mb-4">Your Custom Blouse</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-warm-gray">Design</dt>
                                <dd className="text-charcoal font-medium">{selected.name}</dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-warm-gray">Color</dt>
                                <dd className="flex items-center gap-2">
                                    <span
                                        className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: color }}
                                    />
                                    {color}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-warm-gray">Opening / Fit / Seams</dt>
                                <dd className="text-charcoal text-right">
                                    {labelize(preferences.blouseOpening)} · {labelize(preferences.fitPreference)} ·{' '}
                                    {labelize(preferences.seamAllowance)}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-warm-gray">Cup Padding / Inner-wear</dt>
                                <dd className="text-charcoal text-right">
                                    {preferences.cupPadding ? 'Yes' : 'No'}
                                    {preferences.braSize?.trim() ? ` · ${preferences.braSize.trim()}` : ''}
                                </dd>
                            </div>
                            {MEASUREMENT_GROUPS.map((group) => (
                                <React.Fragment key={group.id}>
                                    <div className="pt-2">
                                        <dt className="font-heading text-sm font-bold text-charcoal">{group.label}</dt>
                                    </div>
                                    {group.fields.map((field) => (
                                        <div key={field} className="flex justify-between border-b border-gray-100 pb-2">
                                            <dt className="text-warm-gray">{MEASUREMENT_LABELS[field]}</dt>
                                            <dd className="text-charcoal">{measurements[field]}&Prime;</dd>
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

                        <div className="mt-6 bg-sage-green-light/40 border border-sage-green rounded-lg p-4 text-sm text-charcoal">
                            Custom blouses are individually quoted. Submit your design and the boutique will get
                            back to you with a price and next steps — no account needed.
                        </div>

                        {/* Contact fields use raw inputs: the shared ui/Input is not
                            forwardRef-compatible, so react-hook-form's register ref
                            would be silently dropped (same approach as step 2). */}
                        <div className="mt-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                                <input
                                    type="text"
                                    {...register('customerName', { required: true })}
                                    className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.customerName && (
                                    <p className="mt-1 text-xs text-red-500">Please enter your name</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        {...register('customerEmail', {
                                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        })}
                                        className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.customerEmail && (
                                        <p className="mt-1 text-xs text-red-500">Please enter a valid email</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        {...register('customerPhone', {
                                            pattern: /^[0-9+\-() ]{7,15}$/,
                                        })}
                                        className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.customerPhone && (
                                        <p className="mt-1 text-xs text-red-500">Please enter a valid phone number</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-warm-gray -mt-2 mb-3">
                                Provide an email or a phone number so the boutique can reach you.
                            </p>

                            {submitError && (
                                <p className="text-sm text-red-500 mb-3" role="alert">{submitError}</p>
                            )}

                            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting…' : 'Submit Request'}
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
