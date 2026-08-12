'use client';

import React from 'react';
import { renderGarment } from '../customizer/rendererRegistry';
import { categoryById } from '@/types/customizerCategories';
import { PatternPreviewConfig } from '@/types/pattern';

// Client wrapper so server pages can show a pattern's SVG sketch without
// importing the (client-only) renderer registry themselves.

const PatternSketch: React.FC<{ previewConfig: PatternPreviewConfig; className?: string }> = ({
    previewConfig,
    className,
}) => {
    const spec = categoryById(previewConfig.renderer)?.spec;
    if (!spec) return null;
    return (
        <div className={className}>
            {renderGarment(previewConfig.renderer, {
                style: previewConfig.style,
                measurements: spec.typicalDefaults,
            })}
        </div>
    );
};

export default PatternSketch;
