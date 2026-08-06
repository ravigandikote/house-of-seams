'use client';

import React from 'react';
import { ComposedSlotConfig } from '../../types/composition';

// Composes 1–3 garment renderers into ONE sketch frame (choli above
// skirt, kameez above salwar…). Child renderers keep their existing
// props interfaces untouched — this component only does layout from
// ComposedSlotConfig values (usually produced by anchorStack in
// src/types/composition.ts). The whole composition lives in a single
// positioned frame, so annotation pins (stored as % of their container)
// land identically here, in admin, and on the atelier page.

export interface ComposedSlot {
    config: ComposedSlotConfig;
    node: React.ReactNode;
}

export interface ComposedPreviewProps {
    /** Frame aspect ratio as height ÷ width (portrait sketches > 1). */
    aspect?: number;
    slots: readonly ComposedSlot[];
    className?: string;
}

const ComposedPreview: React.FC<ComposedPreviewProps> = ({ aspect = 1.25, slots, className = '' }) => {
    return (
        <div
            className={`relative w-full ${className}`}
            style={{ paddingTop: `${aspect * 100}%` }}
        >
            {slots.map(({ config, node }) => (
                <div
                    key={config.key}
                    className="absolute"
                    style={{
                        width: `${config.widthPct}%`,
                        top: `${config.topPct}%`,
                        left: `${50 + (config.centerOffsetPct ?? 0) - config.widthPct / 2}%`,
                        zIndex: config.zIndex ?? 1,
                    }}
                >
                    {node}
                </div>
            ))}
        </div>
    );
};

export default ComposedPreview;
