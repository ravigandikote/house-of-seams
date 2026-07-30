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

    return (
        <div className="mb-3">
            <div className="flex items-baseline justify-between gap-2">
                <label
                    htmlFor={`slider-${field.key}`}
                    className="text-sm font-medium text-gray-700 cursor-help"
                    title={field.description}
                >
                    {field.label}
                    {field.optional && <span className="text-warm-gray font-normal"> (optional)</span>}
                </label>
                <span className="text-xs text-warm-gray tabular-nums whitespace-nowrap">
                    {field.min}–{field.max}{unitSuffix}
                </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
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
                    className="flex-1 accent-dusty-rose cursor-pointer"
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
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-right tabular-nums"
                    />
                    <span className="text-sm text-warm-gray w-3">{unitSuffix}</span>
                </div>
            </div>
        </div>
    );
};

export default MeasurementSlider;
