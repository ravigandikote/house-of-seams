'use client';

import React from 'react';
import BottomsPreview from './BottomsPreview';
import ComposedPreview from './ComposedPreview';
import KurtiPreview from './KurtiPreview';
import { DupattaDrape } from './LehengaEnsemblePreview';
import { anchorStack } from '../../types/composition';
import { BottomsDesignAttributes } from '../../types/bottomsDesign';
import { KurtiDesignAttributes } from '../../types/kurtiDesign';

// THE salwar-suit ensemble sketch — kameez (kurti renderer) layered over
// the bottoms, dupatta drape on top. One home for the composition
// numbers, used by the journey, the atelier page, and the admin
// annotator (pins land on the shared frame).

export interface SalwarSuitEnsemblePreviewProps {
    kameez: KurtiDesignAttributes;
    bottoms: BottomsDesignAttributes;
    dupatta?: boolean;
    /** Combined measurement record (suit spec keys). */
    measurements: Record<string, number>;
    className?: string;
}

// The kameez waist (~36.6% of its canvas) meets the bottoms waistband
// (~8% of theirs); the kameez draws on top so its fall covers the rise.
export const SUIT_FRAME_ASPECT = 0.85;
const SUIT_SLOTS = anchorStack(
    [
        { key: 'kameez', widthPct: 100, childAspect: 220 / 300, anchorBottomFrac: 0.366 },
        { key: 'bottoms', widthPct: 90, childAspect: 200 / 300, anchorTopFrac: 0.08 },
    ],
    { frameAspect: SUIT_FRAME_ASPECT }
);

const SalwarSuitEnsemblePreview: React.FC<SalwarSuitEnsemblePreviewProps> = ({
    kameez,
    bottoms,
    dupatta = false,
    measurements,
    className = '',
}) => {
    return (
        <div className={`relative ${className}`}>
            <ComposedPreview
                aspect={SUIT_FRAME_ASPECT}
                slots={[
                    {
                        config: SUIT_SLOTS[0],
                        node: <KurtiPreview design={kameez} measurements={measurements} />,
                    },
                    {
                        config: SUIT_SLOTS[1],
                        node: <BottomsPreview design={bottoms} measurements={measurements} />,
                    },
                ]}
            />
            {dupatta && <DupattaDrape color={kameez.baseColor} />}
        </div>
    );
};

export default SalwarSuitEnsemblePreview;
