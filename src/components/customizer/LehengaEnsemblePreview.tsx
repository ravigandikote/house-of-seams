'use client';

import React from 'react';
import BlousePreview from './BlousePreview';
import ComposedPreview from './ComposedPreview';
import LehengaPreview from './LehengaPreview';
import { anchorStack } from '../../types/composition';
import { BlouseDesignAttributes } from '../../types/blouseDesign';
import { LehengaDesignAttributes } from '../../types/lehengaDesign';
import { Measurements } from '../../types/measurements';

// THE lehenga ensemble sketch — used by the customizer journey, the
// atelier page, and the admin annotator so the composition numbers live
// in exactly one place. Skirt only → the plain LehengaPreview (identical
// to pre-ensemble behaviour); with a choli → ComposedPreview stacking
// the blouse renderer above the skirt; dupatta → a simple draped-sash
// accent drawn over the whole frame.

export interface LehengaEnsemblePreviewProps {
    skirt: LehengaDesignAttributes;
    choli?: BlouseDesignAttributes | null;
    dupatta?: boolean;
    /** Combined measurement record (skirt keys + choli/blouse keys). */
    measurements: Record<string, number>;
    className?: string;
}

// Tuned against rendered composites (Phase 0): BlousePreview's viewBox
// carries ~17% empty header, hence the negative start.
export const ENSEMBLE_FRAME_ASPECT = 1.12;
const ENSEMBLE_SLOTS = anchorStack(
    [
        { key: 'choli', widthPct: 84, childAspect: 0.8, anchorBottomFrac: 0.56 },
        { key: 'skirt', widthPct: 92, childAspect: 0.93, anchorTopFrac: 0.075 },
    ],
    { frameAspect: ENSEMBLE_FRAME_ASPECT, startTopPct: -9 }
);

/** Draped dupatta accent — one shoulder, across the body, ending at the
 *  opposite hip, with a fold line. Decorative only; shared with the
 *  salwar-suit ensemble. */
export const DupattaDrape: React.FC<{ color: string }> = ({ color }) => (
    <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 112"
        preserveAspectRatio="none"
        // Inline z-index: keeps the drape above composed slots on screen AND
        // tells the PDF rasteriser to paint it last.
        style={{ zIndex: 10 }}
    >
        <path
            d="M34 12 C30 34 42 52 62 72 C70 80 76 88 78 98 L84 96 C82 84 74 74 66 66 C50 50 40 32 42 12 Z"
            fill={color}
            opacity="0.28"
        />
        <path d="M34 12 C30 34 42 52 62 72 C70 80 76 88 78 98" stroke="#2D2D2D" strokeWidth="0.7" fill="none" opacity="0.55" />
        <path d="M42 12 C40 32 50 50 66 66 C74 74 82 84 84 96" stroke="#2D2D2D" strokeWidth="0.7" fill="none" opacity="0.55" />
        <path d="M38 30 C40 38 46 46 52 52" stroke="#2D2D2D" strokeWidth="0.45" fill="none" opacity="0.35" />
    </svg>
);

const LehengaEnsemblePreview: React.FC<LehengaEnsemblePreviewProps> = ({
    skirt,
    choli = null,
    dupatta = false,
    measurements,
    className = '',
}) => {
    const drapeColor = choli?.baseColor ?? skirt.baseColor;

    if (!choli) {
        return (
            <div className={`relative ${className}`}>
                <LehengaPreview styleAttributes={skirt} measurements={measurements} />
                {dupatta && <DupattaDrape color={drapeColor} />}
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <ComposedPreview
                aspect={ENSEMBLE_FRAME_ASPECT}
                slots={[
                    {
                        config: ENSEMBLE_SLOTS[0],
                        node: (
                            <BlousePreview
                                design={choli}
                                measurements={measurements as Measurements}
                                view="front"
                                showCaption={false}
                            />
                        ),
                    },
                    {
                        config: ENSEMBLE_SLOTS[1],
                        node: <LehengaPreview styleAttributes={skirt} measurements={measurements} />,
                    },
                ]}
            />
            {dupatta && <DupattaDrape color={drapeColor} />}
        </div>
    );
};

export default LehengaEnsemblePreview;
