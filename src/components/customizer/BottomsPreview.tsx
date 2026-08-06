'use client';

import React from 'react';
import { BottomsDesignAttributes } from '../../types/bottomsDesign';

// Parametric SVG bottoms preview (front view, two legs). The style
// switches the outline: churidar hugs the leg with gathered bunching at
// the calf/ankle, salwar carries tapered volume with pleat marks,
// palazzo flows wide, straight pants fall in a clean column. All inputs
// clamped so no slider value breaks the drawing.

export interface BottomsPreviewProps {
    design: BottomsDesignAttributes;
    measurements: Record<string, number>;
    className?: string;
}

const S = 3.2;
const CX = 150;
const TOP = 22;
const VIEW_BOX = '0 0 300 200';

const OUTLINE = '#2D2D2D';

const clamp = (v: number, min: number, max: number) =>
    Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (min + max) / 2;

const BottomsPreview: React.FC<BottomsPreviewProps> = ({ design, measurements, className }) => {
    const m = measurements;
    const style = design.bottomStyle;

    const waist = clamp(m.waistRound, 24, 50);
    const hip = clamp(m.hipRound, 28, 54);
    const rise = clamp(m.bodyRise, 9, 15);
    const thigh = clamp(m.thighRound, 16, 34);
    const knee = clamp(m.kneeRound, 12, 22);
    const ankle = clamp(m.ankleRound, 8, 16);
    const length = clamp(m.bottomLength, 34, 44);
    const opening = clamp(m.bottomOpening, 8, 40);

    const waistHalf = (waist / 4) * S;
    const hipHalf = (hip / 4) * S;
    const crotchY = TOP + rise * S * 0.9;
    const hipY = TOP + rise * S * 0.55;
    const hemY = TOP + length * S;
    const kneeY = crotchY + (hemY - crotchY) * 0.45;

    // Per-leg half-widths (a leg's round ÷ 4).
    const thighHalf = (thigh / 4) * S;
    const kneeHalf = (knee / 4) * S;
    const openHalf = (opening / 4) * S;
    // Palazzo/salwar visual volume: leg width follows the opening rather
    // than the body for flowing styles.
    const legTopHalf =
        style === 'palazzo' ? Math.max(thighHalf, openHalf * 0.8) :
        style === 'salwar' ? thighHalf * 1.35 :
        thighHalf;
    const legKneeHalf =
        style === 'palazzo' ? Math.max(kneeHalf, openHalf * 0.9) :
        style === 'salwar' ? kneeHalf * 1.5 :
        style === 'churidar' ? kneeHalf * 0.95 :
        Math.max(kneeHalf, openHalf * 0.9);
    const legHemHalf = style === 'churidar' ? Math.max((ankle / 4) * S, openHalf * 0.8) : openHalf;

    // Leg centres straddle the crotch point.
    const legGap = Math.max(6, hipHalf * 0.36);
    const legCX = (dir: 1 | -1) => CX + dir * legGap;

    function legPath(dir: 1 | -1): string {
        const c = legCX(dir);
        const outerHip = CX + dir * hipHalf;
        // Wide styles (salwar/palazzo) would cross the centre line — the
        // inner seam hugs it instead, keeping the two-leg split readable.
        const inner = (half: number, y: number) => {
            const x = dir === 1 ? Math.max(CX + 1.5, c - half) : Math.min(CX - 1.5, c + half);
            return `${x} ${y}`;
        };
        const outer = (half: number, y: number) => `${c + dir * half} ${y}`;
        // Outer seam: waist → hip → knee → hem; inner seam: hem → knee → crotch.
        return [
            `M ${CX + dir * waistHalf} ${TOP}`,
            `C ${outerHip} ${hipY - 4} ${outerHip} ${hipY} ${outer(Math.max(legTopHalf, hipHalf - legGap), crotchY)}`,
            `C ${outer(legKneeHalf, kneeY - 6)} ${outer(legKneeHalf, kneeY)} ${outer(legKneeHalf, kneeY)}`,
            `C ${outer(legHemHalf, hemY - (hemY - kneeY) * 0.4)} ${outer(legHemHalf, hemY)} ${outer(legHemHalf, hemY)}`,
            `L ${inner(legHemHalf, hemY)}`,
            `C ${inner(legKneeHalf * 0.9, hemY - (hemY - kneeY) * 0.5)} ${inner(legKneeHalf * 0.8, kneeY)} ${inner(legKneeHalf * 0.8, kneeY)}`,
            `L ${CX} ${crotchY}`,
            `L ${CX} ${TOP}`,
            'Z',
        ].join(' ');
    }

    const showChuridarBunching = style === 'churidar';
    const showSalwarPleats = style === 'salwar' && design.pleats === 'pleated';

    return (
        <figure className={className}>
            <svg viewBox={VIEW_BOX} role="img" aria-label="Bottoms preview" className="w-full h-auto">
                {([1, -1] as const).map((dir) => (
                    <path
                        key={dir}
                        d={legPath(dir)}
                        fill={design.baseColor}
                        stroke={OUTLINE}
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        opacity="0.96"
                    />
                ))}

                {/* waistband */}
                <rect
                    x={CX - waistHalf}
                    y={TOP - 6}
                    width={waistHalf * 2}
                    height={7}
                    rx={2}
                    fill={design.baseColor}
                    stroke={OUTLINE}
                    strokeWidth="1.4"
                />
                {design.waistband === 'drawstring' && (
                    <>
                        <path d={`M ${CX - 4} ${TOP + 2} C ${CX - 8} ${TOP + 10} ${CX - 2} ${TOP + 12} ${CX - 5} ${TOP + 16}`} stroke={OUTLINE} strokeWidth="0.8" fill="none" />
                        <path d={`M ${CX + 4} ${TOP + 2} C ${CX + 8} ${TOP + 10} ${CX + 2} ${TOP + 12} ${CX + 5} ${TOP + 16}`} stroke={OUTLINE} strokeWidth="0.8" fill="none" />
                    </>
                )}
                {design.waistband === 'elastic' && (
                    <path d={`M ${CX - waistHalf + 3} ${TOP - 2.5} L ${CX + waistHalf - 3} ${TOP - 2.5}`} stroke={OUTLINE} strokeWidth="0.6" strokeDasharray="2.5 2" fill="none" opacity="0.7" />
                )}

                {/* salwar pleats fanning from the waist */}
                {showSalwarPleats &&
                    [-0.6, -0.3, 0.3, 0.6].map((f) => (
                        <path
                            key={f}
                            d={`M ${CX + f * waistHalf} ${TOP + 2} C ${CX + f * waistHalf * 1.4} ${crotchY} ${CX + f * legGap * 2.4} ${kneeY - 10} ${CX + f * legGap * 2.2} ${kneeY}`}
                            stroke={OUTLINE}
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.35"
                        />
                    ))}

                {/* churidar gathered bunching at calf/ankle */}
                {showChuridarBunching &&
                    ([1, -1] as const).map((dir) =>
                        [0.62, 0.74, 0.86].map((f) => {
                            const y = kneeY + (hemY - kneeY) * f;
                            const c = legCX(dir);
                            const half = legHemHalf + 1.5;
                            return (
                                <path
                                    key={`${dir}-${f}`}
                                    d={`M ${c - half} ${y} Q ${c} ${y + 3.5} ${c + half} ${y}`}
                                    stroke={OUTLINE}
                                    strokeWidth="0.6"
                                    fill="none"
                                    opacity="0.5"
                                />
                            );
                        })
                    )}

                {/* palazzo flow lines */}
                {style === 'palazzo' &&
                    ([1, -1] as const).map((dir) => (
                        <path
                            key={dir}
                            d={`M ${legCX(dir)} ${crotchY + 8} C ${legCX(dir) + dir * 4} ${kneeY} ${legCX(dir) - dir * 3} ${hemY - 20} ${legCX(dir) + dir * 2} ${hemY - 3}`}
                            stroke={OUTLINE}
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.3"
                        />
                    ))}
            </svg>
        </figure>
    );
};

export default BottomsPreview;
