'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AtelierStepper from './AtelierStepper';
import Button from '../ui/Button';
import LehengaPreview from './LehengaPreview';
import MeasurementSliderGroup from './MeasurementSliderGroup';
import { CornerFlourish } from '../ui/decor';
import { SAMPLE_LEHENGA_DESIGNS } from './lehengaSamples';
import { LehengaDesign } from '../../types/lehengaDesign';
import { LEHENGA_MEASUREMENT_SPEC } from '../../types/lehengaMeasurements';

// Lehenga customizer v1: design pick → slider measurements → live
// preview. Ordering is intentionally NOT wired yet (no lehenga_designs
// table or submit flow) — the flow ends at the preview with a note.

const STEPS = ['Choose Design', 'Measurements', 'Preview'] as const;

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
                    </div>
                </div>
            )}

            {/* Step 3: preview */}
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
                            {LEHENGA_MEASUREMENT_SPEC.fields
                                .filter((f) => !f.visibleWhen || f.visibleWhen(styleAttrs))
                                .map((f) => (
                                    <div key={f.key} className="flex justify-between border-b border-champagne-gold/15 pb-2">
                                        <dt className="text-warm-gray">{f.label}</dt>
                                        <dd className="text-charcoal">
                                            {values[f.key]}
                                            {f.unit === 'in' ? '″' : ''}
                                        </dd>
                                    </div>
                                ))}
                        </dl>
                        <div className="mt-6 bg-blush/60 border border-champagne-gold/25 rounded-sm p-5 text-body-sm text-charcoal">
                            <p className="font-accent italic text-lede text-ink mb-1.5">
                                Our lehenga atelier opens its doors soon.
                            </p>
                            Your sketch is safe with you — download-worthy ordering arrives shortly. Until then,{' '}
                            <Link href="/booking" className="link-gold">
                                book a consultation
                            </Link>{' '}
                            and we&apos;ll bring it to life together.
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
