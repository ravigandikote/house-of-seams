'use client';

import React, { useId } from 'react';
import { SLEEVE_LENGTH_BOUNDS } from '../../types/blouseDesign';
import { KurtiDesignAttributes } from '../../types/kurtiDesign';

// Parametric SVG kurti/kameez preview (front view). Style attributes
// drive the LOOK (cut taper, slits, collar, sleeves, embellishment);
// measurements drive the GEOMETRY (widths at bust/waist/hip/hem, lengths).
// Self-contained and swappable behind the same props philosophy as
// BlousePreview/LehengaPreview. All inputs are clamped so no slider
// value can break the drawing.

export interface KurtiPreviewProps {
    design: KurtiDesignAttributes;
    measurements: Record<string, number>;
    className?: string;
}

// 3.4 SVG units per inch; canvas fits the max clamped values.
const S = 3.4;
const CX = 150;
const TOP = 26;
const VIEW_BOX = '0 0 300 220';

const OUTLINE = '#2D2D2D';
const GOLD = '#C9A227';

const clamp = (v: number, min: number, max: number) =>
    Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (min + max) / 2;

const KurtiPreview: React.FC<KurtiPreviewProps> = ({ design, measurements, className }) => {
    const uid = useId();
    const m = measurements;

    // Clamped geometry inputs (inches).
    const shoulderW = clamp(m.shoulderWidth, 10, 22);
    const bust = clamp(m.bust, 20, 60);
    const armhole = clamp(m.armhole, 10, 26);
    // The sleeve STYLE wins over a stale length value (same rule as
    // BlousePreview): a full sleeve never draws 6" long.
    const sleeveBounds = SLEEVE_LENGTH_BOUNDS[design.sleeveStyle];
    const sleeveLen =
        design.sleeveStyle === 'sleeveless'
            ? 0
            : clamp(m.sleeveLength, sleeveBounds.min, sleeveBounds.max);
    const sleeveRound = clamp(m.sleeveRound, 7, 22);
    const shoulderToWaist = clamp(m.shoulderToWaist, 12, 22);
    const kurtiLength = clamp(m.kurtiLength, 34, 50);
    const waist = clamp(m.waistRound, 24, 50);
    const hip = clamp(m.hipRound, 28, 54);
    const hemRound = clamp(m.hemRound, 32, 80);
    const slitLength = clamp(m.slitLength, 8, 18);
    const frontNeckDepth = clamp(m.frontNeckDepth, 2, 12);

    // Key vertical stations.
    const underarmY = TOP + (armhole / 2.6) * S;
    const waistY = TOP + shoulderToWaist * S;
    const hipY = Math.min(waistY + 8 * S, TOP + kurtiLength * S - 12);
    const hemY = TOP + kurtiLength * S;

    // Half-widths (front panel ≈ quarter of the round).
    const shoulderHalf = (shoulderW / 2) * S;
    const bustHalf = (bust / 4) * S;
    const waistHalf = (waist / 4) * S;
    const hipHalf = (hip / 4) * S;
    // Straight cuts fall from the hip; A-line/flared sweep out to hemRound.
    const hemHalf =
        design.cut === 'straight'
            ? Math.max(hipHalf, (hemRound / 4) * S * 0.92)
            : Math.max(hipHalf + 4, (hemRound / 4) * S);

    // Neckline.
    const neckHalf = Math.max(10, shoulderHalf * 0.34);
    const isCollared = design.neckline === 'band' || design.neckline === 'mandarin' || design.neckline === 'shirt';
    const neckDepth =
        design.neckline === 'high' || isCollared
            ? frontNeckDepth * S * 0.45
            : frontNeckDepth * S * (design.neckline === 'boat' ? 0.5 : 1);

    function neckPath(): string {
        const l = CX - neckHalf;
        const r = CX + neckHalf;
        const d = TOP + neckDepth;
        switch (design.neckline) {
            case 'v':
                return `M ${l} ${TOP} L ${CX} ${d} L ${r} ${TOP}`;
            case 'square':
                return `M ${l} ${TOP} L ${l} ${d} L ${r} ${d} L ${r} ${TOP}`;
            case 'sweetheart':
                return `M ${l} ${TOP} C ${l} ${d * 0.96} ${CX - 3} ${d} ${CX} ${d - 4} C ${CX + 3} ${d} ${r} ${d * 0.96} ${r} ${TOP}`;
            case 'boat':
                return `M ${l - 5} ${TOP} Q ${CX} ${d} ${r + 5} ${TOP}`;
            default:
                // round / high / band / mandarin / shirt sit on a round opening
                return `M ${l} ${TOP} Q ${CX} ${d * 1.15} ${r} ${TOP}`;
        }
    }

    // Sleeves: a tapered band along the arm axis (~24° off vertical) with
    // the cuff drawn perpendicular to the arm — the same construction that
    // fixed BlousePreview's self-intersecting sleeves.
    const sin = 0.4067, cos = 0.9135;
    const sleeveTopY = TOP + 4;
    const cuffHalf = Math.max(4, (sleeveRound / 4) * S * 0.9);

    function sleevePath(dir: 1 | -1): string {
        if (design.sleeveStyle === 'sleeveless' || sleeveLen === 0) return '';
        const tipX = CX + dir * shoulderHalf;
        // Arm direction (outward + down) and cuff centre.
        const cx = tipX + dir * sin * sleeveLen * S;
        const cy = sleeveTopY + cos * sleeveLen * S;
        // Cuff corners perpendicular to the arm axis.
        const cuffOutX = cx + dir * cos * cuffHalf;
        const cuffOutY = cy - sin * cuffHalf;
        const cuffInX = cx - dir * cos * cuffHalf;
        const cuffInY = cy + sin * cuffHalf;
        const underarmX = CX + dir * (bustHalf + 1);
        return `M ${tipX} ${sleeveTopY} L ${cuffOutX} ${cuffOutY} L ${cuffInX} ${cuffInY} L ${underarmX} ${underarmY} Z`;
    }

    // Body outline (one path, mirrored maths).
    const bodyPath = [
        `M ${CX - neckHalf} ${TOP}`,
        `L ${CX - shoulderHalf} ${TOP + 4}`,
        `L ${CX - bustHalf - 1} ${underarmY}`,
        `C ${CX - bustHalf} ${underarmY + 14} ${CX - waistHalf - 2} ${waistY - 10} ${CX - waistHalf} ${waistY}`,
        `C ${CX - waistHalf} ${waistY + 8} ${CX - hipHalf} ${hipY - 6} ${CX - hipHalf} ${hipY}`,
        design.cut === 'straight'
            ? `L ${CX - hemHalf} ${hemY}`
            : `C ${CX - hipHalf - 4} ${hipY + (hemY - hipY) * 0.45} ${CX - hemHalf} ${hemY - (hemY - hipY) * 0.3} ${CX - hemHalf} ${hemY}`,
        `Q ${CX} ${hemY + 4} ${CX + hemHalf} ${hemY}`,
        design.cut === 'straight'
            ? `L ${CX + hipHalf} ${hipY}`
            : `C ${CX + hemHalf} ${hemY - (hemY - hipY) * 0.3} ${CX + hipHalf + 4} ${hipY + (hemY - hipY) * 0.45} ${CX + hipHalf} ${hipY}`,
        `C ${CX + hipHalf} ${hipY - 6} ${CX + waistHalf} ${waistY + 8} ${CX + waistHalf} ${waistY}`,
        `C ${CX + waistHalf + 2} ${waistY - 10} ${CX + bustHalf} ${underarmY + 14} ${CX + bustHalf + 1} ${underarmY}`,
        `L ${CX + shoulderHalf} ${TOP + 4}`,
        `L ${CX + neckHalf} ${TOP}`,
    ].join(' ');

    const slitTopY = Math.max(hipY + 6, hemY - slitLength * S);
    const showPattern = design.embellishment !== 'plain';
    const patternId = `kurti-pattern-${uid}`;

    return (
        <figure className={className}>
            <svg viewBox={VIEW_BOX} role="img" aria-label="Kurti preview" className="w-full h-auto">
                {showPattern && (
                    <defs>
                        <pattern id={patternId} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                            <rect width="7" height="7" fill={design.baseColor} />
                            <line x1="0" y1="0" x2="0" y2="7" stroke={GOLD} strokeWidth="0.7" opacity="0.55" />
                        </pattern>
                    </defs>
                )}

                {/* sleeves behind the body */}
                {sleevePath(-1) && (
                    <path d={sleevePath(-1)} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" opacity="0.92" />
                )}
                {sleevePath(1) && (
                    <path d={sleevePath(1)} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round" opacity="0.92" />
                )}

                {/* body */}
                <path
                    d={`${bodyPath} ${neckPath()} Z`}
                    fill={showPattern ? `url(#${patternId})` : design.baseColor}
                    stroke={OUTLINE}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
                {/* neckline emphasised */}
                <path d={neckPath()} fill="none" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" />
                {design.embellishment !== 'plain' && (
                    <path d={neckPath()} fill="none" stroke={GOLD} strokeWidth="0.9" opacity="0.9" transform="translate(0 2.2)" />
                )}

                {/* collars */}
                {(design.neckline === 'band' || design.neckline === 'mandarin') && (
                    <path
                        d={`M ${CX - neckHalf} ${TOP} Q ${CX} ${TOP - (design.neckline === 'mandarin' ? 7 : 5)} ${CX + neckHalf} ${TOP}`}
                        fill="none"
                        stroke={OUTLINE}
                        strokeWidth="1.6"
                    />
                )}
                {design.neckline === 'shirt' && (
                    <>
                        <path d={`M ${CX - neckHalf} ${TOP} L ${CX - neckHalf - 8} ${TOP + 9} L ${CX - 2} ${TOP + 6} Z`} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.2" />
                        <path d={`M ${CX + neckHalf} ${TOP} L ${CX + neckHalf + 8} ${TOP + 9} L ${CX + 2} ${TOP + 6} Z`} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.2" />
                    </>
                )}

                {/* seams: waist shaping darts */}
                <path d={`M ${CX - waistHalf * 0.55} ${underarmY + 10} L ${CX - waistHalf * 0.5} ${waistY + 8}`} stroke={OUTLINE} strokeWidth="0.5" opacity="0.35" fill="none" />
                <path d={`M ${CX + waistHalf * 0.55} ${underarmY + 10} L ${CX + waistHalf * 0.5} ${waistY + 8}`} stroke={OUTLINE} strokeWidth="0.5" opacity="0.35" fill="none" />

                {/* slits */}
                {design.slit === 'side_slits' && (
                    <>
                        <line x1={CX - hemHalf + 1.5} y1={hemY - 1} x2={CX - hipHalf + 1} y2={slitTopY} stroke={OUTLINE} strokeWidth="1.1" opacity="0.85" />
                        <line x1={CX + hemHalf - 1.5} y1={hemY - 1} x2={CX + hipHalf - 1} y2={slitTopY} stroke={OUTLINE} strokeWidth="1.1" opacity="0.85" />
                    </>
                )}
                {design.slit === 'front_slit' && (
                    <line x1={CX} y1={hemY + 2} x2={CX} y2={slitTopY} stroke={OUTLINE} strokeWidth="1.1" opacity="0.85" />
                )}

                {/* hem border */}
                <path
                    d={`M ${CX - hemHalf} ${hemY - 5} Q ${CX} ${hemY - 1} ${CX + hemHalf} ${hemY - 5}`}
                    fill="none"
                    stroke={design.embellishment === 'plain' ? OUTLINE : GOLD}
                    strokeWidth={design.embellishment === 'plain' ? 0.5 : 1}
                    opacity={design.embellishment === 'plain' ? 0.3 : 0.85}
                />
            </svg>
        </figure>
    );
};

export default KurtiPreview;
