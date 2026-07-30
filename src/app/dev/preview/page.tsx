'use client';

// DEV-ONLY category-aware measurement editor. Not linked from the site.
// TODO: remove this route (src/app/dev/) before production deploy.

import React, { useState } from 'react';
import BlousePreview from '../../../components/customizer/BlousePreview';
import LehengaPreview from '../../../components/customizer/LehengaPreview';
import MeasurementSliderGroup from '../../../components/customizer/MeasurementSliderGroup';
import {
    BlouseDesignAttributes,
    NECK_STYLES,
    BACK_STYLES,
    SLEEVE_STYLES,
    CLOSURES,
    EMBELLISHMENTS,
} from '../../../types/blouseDesign';
import {
    LehengaDesignAttributes,
    LEHENGA_SILHOUETTES,
    LEHENGA_CLOSURES,
} from '../../../types/lehengaDesign';
import { Measurements, BLOUSE_MEASUREMENT_SPEC } from '../../../types/measurements';
import { LEHENGA_MEASUREMENT_SPEC } from '../../../types/lehengaMeasurements';
import { CategoryMeasurementSpec } from '../../../types/measurementSpec';
import { CUSTOMIZER_CATEGORIES } from '../../../types/customizerCategories';

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const selectClass = 'mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 bg-white text-sm';

function StyleSelect<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T;
    options: readonly T[];
    onChange: (v: T) => void;
}) {
    return (
        <label className="text-sm text-gray-700">
            {label}
            <select value={value} onChange={(e) => onChange(e.target.value as T)} className={selectClass}>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {labelize(opt)}
                    </option>
                ))}
            </select>
        </label>
    );
}

function SliderPanel({
    spec,
    values,
    styleAttrs,
    onChange,
    onReset,
}: {
    spec: CategoryMeasurementSpec;
    values: Record<string, number>;
    styleAttrs: Record<string, string>;
    onChange: (key: string, value: number) => void;
    onReset: () => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-lg font-bold text-charcoal">Measurements</h2>
                <button
                    type="button"
                    onClick={onReset}
                    className="text-sm text-dusty-rose underline hover:text-dusty-rose-dark"
                >
                    Reset to typical
                </button>
            </div>
            {spec.groups.map((group) => (
                <MeasurementSliderGroup
                    key={group.key}
                    spec={spec}
                    group={group}
                    values={values}
                    styleAttrs={styleAttrs}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}

const initialBlouse: BlouseDesignAttributes = {
    neckStyle: 'round',
    backStyle: 'round',
    sleeveStyle: 'short',
    closure: 'hook',
    embellishment: 'plain',
    baseColor: '#D6A6B1',
};

const initialLehenga: LehengaDesignAttributes = {
    silhouette: 'a_line',
    closure: 'side_zip',
    embellishment: 'plain',
    baseColor: '#D6A6B1',
};

const DevPreviewPage = () => {
    const [category, setCategory] = useState<'blouse' | 'lehenga'>('blouse');

    const [blouseAttrs, setBlouseAttrs] = useState<BlouseDesignAttributes>(initialBlouse);
    const [blouseValues, setBlouseValues] = useState<Record<string, number>>({
        ...BLOUSE_MEASUREMENT_SPEC.typicalDefaults,
    });

    const [lehengaAttrs, setLehengaAttrs] = useState<LehengaDesignAttributes>(initialLehenga);
    const [lehengaValues, setLehengaValues] = useState<Record<string, number>>({
        ...LEHENGA_MEASUREMENT_SPEC.typicalDefaults,
    });

    const isBlouse = category === 'blouse';
    const spec = isBlouse ? BLOUSE_MEASUREMENT_SPEC : LEHENGA_MEASUREMENT_SPEC;
    const values = isBlouse ? blouseValues : lehengaValues;
    const setValues = isBlouse ? setBlouseValues : setLehengaValues;
    const styleAttrs: Record<string, string> = isBlouse ? { ...blouseAttrs } : { ...lehengaAttrs };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 mb-6 text-sm font-medium">
                DEV-ONLY measurement editor — remove <code>src/app/dev/</code> before production.
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-6">
                {CUSTOMIZER_CATEGORIES.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        disabled={!c.available}
                        onClick={() => (c.id === 'blouse' || c.id === 'lehenga') && setCategory(c.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            category === c.id
                                ? 'bg-dusty-rose border-dusty-rose text-white'
                                : c.available
                                    ? 'bg-white border-gray-300 text-gray-700 hover:border-dusty-rose'
                                    : 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preview: above sliders on mobile, sticky beside them on desktop */}
                <div className="order-first md:order-last">
                    <div className="sticky top-2 md:top-20 z-10">
                        {isBlouse ? (
                            <div className="flex flex-col gap-4">
                                {(['front', 'back'] as const).map((v) => (
                                    <div key={v} className="bg-cream rounded-lg p-4 shadow-sm w-full max-w-[340px] mx-auto">
                                        <BlousePreview
                                            design={blouseAttrs}
                                            measurements={blouseValues as Measurements}
                                            view={v}
                                            showCaption={false}
                                        />
                                        <p className="text-center text-xs text-warm-gray mt-1">
                                            {v === 'front' ? 'Front' : 'Back'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-cream rounded-lg p-4 shadow-sm">
                                <LehengaPreview
                                    styleAttributes={lehengaAttrs}
                                    measurements={lehengaValues}
                                    className="max-w-[240px] sm:max-w-xs mx-auto"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Styles + sliders */}
                <div>
                    <h2 className="font-heading text-lg font-bold text-charcoal mb-3">Design</h2>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {isBlouse ? (
                            <>
                                <StyleSelect label="Neck Style" value={blouseAttrs.neckStyle} options={NECK_STYLES}
                                    onChange={(v) => setBlouseAttrs({ ...blouseAttrs, neckStyle: v })} />
                                <StyleSelect label="Back Style" value={blouseAttrs.backStyle} options={BACK_STYLES}
                                    onChange={(v) => setBlouseAttrs({ ...blouseAttrs, backStyle: v })} />
                                <StyleSelect label="Sleeve Style" value={blouseAttrs.sleeveStyle} options={SLEEVE_STYLES}
                                    onChange={(v) => setBlouseAttrs({ ...blouseAttrs, sleeveStyle: v })} />
                                <StyleSelect label="Closure" value={blouseAttrs.closure} options={CLOSURES}
                                    onChange={(v) => setBlouseAttrs({ ...blouseAttrs, closure: v })} />
                                <StyleSelect label="Embellishment" value={blouseAttrs.embellishment} options={EMBELLISHMENTS}
                                    onChange={(v) => setBlouseAttrs({ ...blouseAttrs, embellishment: v })} />
                                <label className="text-sm text-gray-700">
                                    Base Color
                                    <input type="color" value={blouseAttrs.baseColor}
                                        onChange={(e) => setBlouseAttrs({ ...blouseAttrs, baseColor: e.target.value })}
                                        className="mt-1 block w-full h-9 border border-gray-300 rounded-md" />
                                </label>
                            </>
                        ) : (
                            <>
                                <StyleSelect label="Silhouette" value={lehengaAttrs.silhouette} options={LEHENGA_SILHOUETTES}
                                    onChange={(v) => setLehengaAttrs({ ...lehengaAttrs, silhouette: v })} />
                                <StyleSelect label="Closure" value={lehengaAttrs.closure} options={LEHENGA_CLOSURES}
                                    onChange={(v) => setLehengaAttrs({ ...lehengaAttrs, closure: v })} />
                                <StyleSelect label="Embellishment" value={lehengaAttrs.embellishment} options={EMBELLISHMENTS}
                                    onChange={(v) => setLehengaAttrs({ ...lehengaAttrs, embellishment: v })} />
                                <label className="text-sm text-gray-700">
                                    Base Color
                                    <input type="color" value={lehengaAttrs.baseColor}
                                        onChange={(e) => setLehengaAttrs({ ...lehengaAttrs, baseColor: e.target.value })}
                                        className="mt-1 block w-full h-9 border border-gray-300 rounded-md" />
                                </label>
                            </>
                        )}
                    </div>

                    <SliderPanel
                        spec={spec}
                        values={values}
                        styleAttrs={styleAttrs}
                        onChange={(key, v) => setValues((prev) => ({ ...prev, [key]: v }))}
                        onReset={() => setValues({ ...spec.typicalDefaults })}
                    />
                </div>
            </div>
        </div>
    );
};

export default DevPreviewPage;
