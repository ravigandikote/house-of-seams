'use client';

import React, { useState } from 'react';
import MeasurementSlider from './MeasurementSlider';
import {
    CategoryMeasurementSpec,
    MeasurementGroupDef,
    StyleAttributes,
    visibleFieldsForGroup,
} from '../../types/measurementSpec';

// One collapsible group of measurement sliders (same visual language as
// the grouped measurement step: heading with a dusty-rose underline).
// Fields with visibleWhen are filtered against the selected design's
// style attributes, so e.g. mermaid-only fields hide for A-line designs.

interface MeasurementSliderGroupProps {
    spec: CategoryMeasurementSpec;
    group: MeasurementGroupDef;
    values: Record<string, number>;
    styleAttrs: StyleAttributes;
    onChange: (key: string, value: number) => void;
}

const MeasurementSliderGroup: React.FC<MeasurementSliderGroupProps> = ({
    spec,
    group,
    values,
    styleAttrs,
    onChange,
}) => {
    const [open, setOpen] = useState(true);
    const fields = visibleFieldsForGroup(spec, group.key, styleAttrs);
    if (fields.length === 0) return null;

    return (
        <section className="mb-4">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="w-full flex items-center justify-between font-heading text-base font-bold text-charcoal border-b border-dusty-rose/40 pb-1 mb-3"
            >
                <span>{group.label}</span>
                <span aria-hidden className="text-warm-gray text-sm">{open ? '−' : '+'}</span>
            </button>
            {open && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    {fields.map((field) => (
                        <MeasurementSlider
                            key={field.key}
                            field={field}
                            value={values[field.key] ?? field.defaultValue}
                            onChange={(v) => onChange(field.key, v)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default MeasurementSliderGroup;
