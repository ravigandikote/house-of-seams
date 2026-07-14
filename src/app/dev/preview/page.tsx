'use client';

// DEV-ONLY harness for BlousePreview. Not linked from anywhere on the
// site. TODO: remove this route (src/app/dev/) before production deploy.

import React, { useState } from 'react';
import BlousePreview from '../../../components/customizer/BlousePreview';
import {
    BlouseDesignAttributes,
    NECK_STYLES,
    BACK_STYLES,
    SLEEVE_STYLES,
    CLOSURES,
    EMBELLISHMENTS,
} from '../../../types/blouseDesign';
import {
    Measurements,
    MEASUREMENT_FIELDS,
    MEASUREMENT_LABELS,
    MEASUREMENT_RANGES,
} from '../../../types/measurements';

const initialDesign: BlouseDesignAttributes = {
    neckStyle: 'round',
    backStyle: 'round',
    sleeveStyle: 'short',
    closure: 'hook',
    embellishment: 'plain',
    baseColor: '#D6A6B1',
};

const initialMeasurements: Measurements = {
    bust: 34,
    waist: 28,
    shoulderWidth: 14,
    blouseLength: 14,
    sleeveLength: 6,
    armhole: 15.5,
    frontNeckDepth: 6.5,
    backNeckDepth: 7,
};

const styleSelects = [
    { key: 'neckStyle', label: 'Neck Style', options: NECK_STYLES },
    { key: 'backStyle', label: 'Back Style', options: BACK_STYLES },
    { key: 'sleeveStyle', label: 'Sleeve Style', options: SLEEVE_STYLES },
    { key: 'closure', label: 'Closure', options: CLOSURES },
    { key: 'embellishment', label: 'Embellishment', options: EMBELLISHMENTS },
] as const;

const DevPreviewPage = () => {
    const [design, setDesign] = useState<BlouseDesignAttributes>(initialDesign);
    const [measurements, setMeasurements] = useState<Measurements>(initialMeasurements);
    const [view, setView] = useState<'front' | 'back'>('front');

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 mb-6 text-sm font-medium">
                DEV-ONLY preview harness — remove <code>src/app/dev/</code> before production.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div>
                        <h2 className="font-heading text-lg font-bold text-charcoal mb-3">Design</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {styleSelects.map(({ key, label, options }) => (
                                <label key={key} className="text-sm text-gray-700">
                                    {label}
                                    <select
                                        value={design[key]}
                                        onChange={(e) =>
                                            setDesign({ ...design, [key]: e.target.value })
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                                    >
                                        {options.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ))}
                            <label className="text-sm text-gray-700">
                                Base Color
                                <input
                                    type="color"
                                    value={design.baseColor}
                                    onChange={(e) => setDesign({ ...design, baseColor: e.target.value })}
                                    className="mt-1 block w-full h-9 border border-gray-300 rounded-md"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-heading text-lg font-bold text-charcoal mb-3">
                            Measurements (inches)
                        </h2>
                        <div className="space-y-2">
                            {MEASUREMENT_FIELDS.map((field) => {
                                const { min, max } = MEASUREMENT_RANGES[field];
                                return (
                                    <label key={field} className="flex items-center gap-3 text-sm text-gray-700">
                                        <span className="w-36 shrink-0">{MEASUREMENT_LABELS[field]}</span>
                                        <input
                                            type="range"
                                            min={min}
                                            max={max}
                                            step={0.5}
                                            value={measurements[field]}
                                            onChange={(e) =>
                                                setMeasurements({
                                                    ...measurements,
                                                    [field]: Number(e.target.value),
                                                })
                                            }
                                            className="flex-1 accent-dusty-rose"
                                        />
                                        <span className="w-10 text-right tabular-nums">
                                            {measurements[field]}&Prime;
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {(['front', 'back'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    view === v
                                        ? 'bg-dusty-rose text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {v === 'front' ? 'Front' : 'Back'}
                            </button>
                        ))}
                    </div>
                    <div className="bg-cream rounded-lg p-6 animate-fade-in">
                        <BlousePreview design={design} measurements={measurements} view={view} className="max-w-sm mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevPreviewPage;
