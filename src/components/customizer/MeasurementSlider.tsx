'use client';

import React, { useEffect, useState } from 'react';
import { MeasurementFieldSpec, clampToSpec } from '../../types/measurementSpec';

// One measurement as a slider PAIRED with an exact numeric input —
// tailors need precise values like 14.25, so the slider alone is not
// enough. Both stay in sync; the numeric input clamps to [min, max] and
// snaps to integer fields on commit (blur/Enter). The range input keeps
// native keyboard semantics (arrow keys adjust by step).

interface MeasurementSliderProps {
    field: MeasurementFieldSpec;
    value: number;
    onChange: (value: number) => void;
}

const MeasurementSlider: React.FC<MeasurementSliderProps> = ({ field, value, onChange }) => {
    // Free-typing buffer for the numeric input; committed on blur/Enter.
    const [text, setText] = useState(String(value));
    useEffect(() => {
        setText(String(value));
    }, [value]);

    const commitText = () => {
        const parsed = clampToSpec(field, parseFloat(text));
        setText(String(parsed));
        if (parsed !== value) onChange(parsed);
    };

    const unitSuffix = field.unit === 'in' ? '″' : '';
    // Dusty-rose → deep-rose gradient fill up to the current value.
    const pct = ((value - field.min) / (field.max - field.min)) * 100;
    const trackStyle: React.CSSProperties = {
        background: `linear-gradient(to right, #D6A6B1 0%, #A4586A ${pct}%, #F0E4DC ${pct}%)`,
    };

    return (
        <div className="mb-4">
            <div className="flex items-baseline justify-between gap-2">
                <label
                    htmlFor={`slider-${field.key}`}
                    className="text-body-sm font-medium text-charcoal cursor-help"
                    title={field.description}
                >
                    {field.label}
                    {field.optional && <span className="text-warm-gray font-normal"> (optional)</span>}
                </label>
                <span className="text-caption text-warm-gray tabular-nums whitespace-nowrap">
                    {field.min}–{field.max}{unitSuffix}
                </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
                <input
                    id={`slider-${field.key}`}
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    aria-label={`${field.label}${field.unit === 'in' ? ' in inches' : ''}`}
                    aria-valuetext={`${value}${unitSuffix}`}
                    onChange={(e) => onChange(clampToSpec(field, Number(e.target.value)))}
                    className="range-couture flex-1 cursor-pointer"
                    style={trackStyle}
                />
                <div className="flex items-center gap-1 shrink-0">
                    <input
                        type="number"
                        inputMode="decimal"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={text}
                        aria-label={`${field.label} exact value`}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={commitText}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                commitText();
                            }
                        }}
                        className="w-20 !bg-white rounded-sm px-2 py-1 text-body-sm text-right tabular-nums"
                    />
                    <span className="text-body-sm text-champagne-gold-dark w-3">{unitSuffix}</span>
                </div>
            </div>
        </div>
    );
};

export default MeasurementSlider;
