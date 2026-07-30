'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import LehengaPreview from './LehengaPreview';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import { SAMPLE_LEHENGA_DESIGNS } from './lehengaSamples';
import { LehengaDesign } from '../../types/lehengaDesign';
import { LEHENGA_MEASUREMENT_SPEC } from '../../types/lehengaMeasurements';

// Lehenga customizer v1: design pick → slider measurements → live
// preview. Ordering is intentionally NOT wired yet (no lehenga_designs
// table or submit flow) — the flow ends at the preview with a note.

const STEPS = ['Design', 'Measurements', 'Preview'] as const;

const LehengaFlow: React.FC = () => {
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState<LehengaDesign | null>(null);
    const [color, setColor] = useState('#D6A6B1');
    const [values, setValues] = useState<Record<string, number>>({
        ...LEHENGA_MEASUREMENT_SPEC.typicalDefaults,
    });

    const previewAttrs = selected ? { ...selected, baseColor: color } : null;
    const styleAttrs: Record<string, string> = selected
        ? { silhouette: selected.silhouette, closure: selected.closure, embellishment: selected.embellishment }
        : {};

    return (
        <div>
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
                                className={`text-left bg-white rounded-lg shadow-sm border transition-all duration-200 overflow-hidden hover:shadow-md ${
                                    isSelected ? 'border-dusty-rose ring-2 ring-dusty-rose' : 'border-gray-200'
                                }`}
                            >
                                <div className="bg-cream p-3">
                                    <LehengaPreview
                                        styleAttributes={design}
                                        measurements={LEHENGA_MEASUREMENT_SPEC.typicalDefaults}
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
            )}

            {/* Step 2: slider measurements with live preview */}
            {step === 1 && previewAttrs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="order-first md:order-last">
                        <div className="sticky top-2 md:top-24 z-10">
                            <p className="text-sm font-medium text-gray-700 mb-2 text-center">Live preview</p>
                            <div className="bg-cream rounded-lg p-4 shadow-sm">
                                <LehengaPreview
                                    styleAttributes={previewAttrs}
                                    measurements={values}
                                    className="max-w-[220px] sm:max-w-xs mx-auto"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-warm-gray mb-4">
                            All values in inches — drag a slider or type an exact value. Detailed measuring
                            instructions for lehengas are coming soon in our{' '}
                            <Link href="/measurement-guide" target="_blank" className="text-dusty-rose underline">
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
                            <label className="block text-sm font-medium text-gray-700">Lehenga Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: preview */}
            {step === 2 && previewAttrs && selected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-cream rounded-lg p-6">
                        <LehengaPreview
                            styleAttributes={previewAttrs}
                            measurements={values}
                            className="max-w-sm mx-auto"
                        />
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-charcoal mb-4">Your Custom Lehenga</h3>
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
                            {LEHENGA_MEASUREMENT_SPEC.fields
                                .filter((f) => !f.visibleWhen || f.visibleWhen(styleAttrs))
                                .map((f) => (
                                    <div key={f.key} className="flex justify-between border-b border-gray-100 pb-2">
                                        <dt className="text-warm-gray">{f.label}</dt>
                                        <dd className="text-charcoal">
                                            {values[f.key]}
                                            {f.unit === 'in' ? '″' : ''}
                                        </dd>
                                    </div>
                                ))}
                        </dl>
                        <div className="mt-6 bg-sage-green-light/40 border border-sage-green rounded-lg p-4 text-sm text-charcoal">
                            Lehenga ordering and the detailed measurement guide are coming soon. Until then,{' '}
                            <Link href="/booking" className="text-dusty-rose underline">
                                book a consultation
                            </Link>{' '}
                            and we&apos;ll design it together.
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
