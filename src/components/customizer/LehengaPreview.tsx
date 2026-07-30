'use client';

import React, { useId } from 'react';
import { LehengaDesignAttributes } from '../../types/lehengaDesign';
import { LEHENGA_MEASUREMENT_SPEC } from '../../types/lehengaMeasurements';
import { clampToSpec } from '../../types/measurementSpec';

// Parametric SVG lehenga preview, modeled on BlousePreview: style
// attributes drive the LOOK (silhouette outline, closure hint,
// embellishment pattern, colour); measurements drive the GEOMETRY.
// Self-contained and swappable behind this props interface.

export interface LehengaPreviewProps {
    styleAttributes: LehengaDesignAttributes;
    measurements: Record<string, number>;
    className?: string;
}

// 6 SVG units per inch on a fixed canvas so changes are visibly
// proportional. Canvas sized for max clamped values (hem ghera 240″).
const S = 6;
const CX = 200;
const TOP = 28;
const VIEW_BOX = '0 0 400 372';

const OUTLINE = '#2D2D2D';
const GOLD = '#C9A227';

const round1 = (n: number): number => Math.round(n * 10) / 10;

const LehengaPreview: React.FC<LehengaPreviewProps> = ({ styleAttributes, measurements, className }) => {
    const uid = useId().replace(/[:]/g, '');
    const patternId = `lehenga-pat-${uid}`;

    // Clamp every measurement to its spec range so extreme or partial
    // input never breaks the drawing.
    const m: Record<string, number> = {};
    for (const field of LEHENGA_MEASUREMENT_SPEC.fields) {
        m[field.key] = clampToSpec(field, measurements[field.key]);
    }
    const { silhouette, closure, embellishment, baseColor } = styleAttributes;

    // --- Geometry (SVG units) ---
    const bandH = round1(m.waistbandWidth * S);
    const bandBottom = TOP + bandH;
    const waistHalf = round1((m.waistRound / 4) * S);
    const hipHalf = round1(Math.max((m.hipRound / 4) * S, waistHalf + 4));
    const hipY = round1(bandBottom + m.waistToHipDepth * S);
    const hemY = round1(Math.max(bandBottom + m.lehengaLength * S, hipY + 40));

    // Hem width: front half of the ghera, foreshortened (ghera/8 per side),
    // plus a little extra body from the can-can.
    const canCan = m.canCanVolume;
    const hemHalfRaw = (m.flareGhera / 8) * S + canCan * 4;
    const hemCurveDepth = round1(4 + canCan * 7);

    // Mermaid-only geometry, kept sane relative to the other values.
    const kneeY = round1(Math.min(bandBottom + m.waistToKneeLength * S, hemY - 36));
    const thighHalf = round1(Math.min(Math.max((m.thighRound / 4) * S, 20), hipHalf));
    const kneeHalf = round1(Math.min(Math.max((m.kneeRound / 4) * S, 16), thighHalf - 2));

    // Silhouette-specific hem width, capped to stay inside the canvas.
    const hemHalf = round1(
        Math.min(
            190,
            silhouette === 'straight'
                ? Math.min(hipHalf + 6 + (hemHalfRaw - 45) * 0.15, hipHalf + 24)
                : silhouette === 'circular'
                    ? Math.max(hemHalfRaw * 1.1, hipHalf + 30)
                    : silhouette === 'mermaid'
                        ? Math.max(hemHalfRaw, kneeHalf + 30)
                        : Math.max(hemHalfRaw, hipHalf + 10) // a_line / paneled
        )
    );

    // One side of the skirt outline, from waistband edge down to the hem
    // corner (mirrored for the other side). side: -1 left, +1 right.
    function sideEdge(side: -1 | 1): string {
        const wx = round1(CX + side * waistHalf);
        const hx = round1(CX + side * hipHalf);
        const ex = round1(CX + side * hemHalf);
        if (silhouette === 'mermaid') {
            const tx = round1(CX + side * thighHalf);
            const kx = round1(CX + side * kneeHalf);
            const thighY = round1(hipY + (kneeY - hipY) * 0.5);
            // Controls hug the chord for a smooth, monotone fitted taper
            // (no vase-like S-bulges), then the flare kicks below the knee.
            return (
                `C ${wx} ${round1(bandBottom + (hipY - bandBottom) * 0.5)} ${hx} ${round1(hipY - 6)} ${hx} ${hipY} ` +
                `C ${hx} ${round1(hipY + (thighY - hipY) * 0.6)} ${tx} ${round1(thighY - (thighY - hipY) * 0.2)} ${tx} ${thighY} ` +
                `C ${tx} ${round1(thighY + (kneeY - thighY) * 0.5)} ${kx} ${round1(kneeY - (kneeY - thighY) * 0.3)} ${kx} ${kneeY} ` +
                `C ${kx} ${round1(kneeY + (hemY - kneeY) * 0.6)} ${ex} ${round1(hemY - (hemY - kneeY) * 0.3)} ${ex} ${hemY}`
            );
        }
        if (silhouette === 'straight') {
            return (
                `C ${wx} ${round1(bandBottom + (hipY - bandBottom) * 0.5)} ${hx} ${round1(hipY - 8)} ${hx} ${hipY} ` +
                `C ${hx} ${round1(hipY + (hemY - hipY) * 0.4)} ${ex} ${round1(hemY - (hemY - hipY) * 0.3)} ${ex} ${hemY}`
            );
        }
        if (silhouette === 'circular') {
            // full bell: sides bulge outward from the hip
            return (
                `C ${wx} ${round1(bandBottom + (hipY - bandBottom) * 0.5)} ${hx} ${round1(hipY - 8)} ${hx} ${hipY} ` +
                `C ${round1(hx + side * (hemHalf - hipHalf) * 0.55)} ${round1(hipY + (hemY - hipY) * 0.3)} ${ex} ${round1(hemY - (hemY - hipY) * 0.28)} ${ex} ${hemY}`
            );
        }
        // a_line / paneled: clean taper — first control ON the hip→hem
        // chord (45%/45%) so the edge never bows concave and the outer
        // kali seams stay inside the body.
        return (
            `C ${wx} ${round1(bandBottom + (hipY - bandBottom) * 0.5)} ${hx} ${round1(hipY - 8)} ${hx} ${hipY} ` +
            `C ${round1(hx + side * (hemHalf - hipHalf) * 0.45)} ${round1(hipY + (hemY - hipY) * 0.45)} ${ex} ${round1(hemY - (hemY - hipY) * 0.2)} ${ex} ${hemY}`
        );
    }

    // Full skirt body: down the left edge, across the hem curve, up the right.
    const lHem = round1(CX - hemHalf);
    const rHem = round1(CX + hemHalf);
    const hemDip = round1(hemY + hemCurveDepth);
    const skirtPath =
        `M ${round1(CX - waistHalf)} ${bandBottom} ` +
        sideEdge(-1) +
        ` Q ${CX} ${hemDip} ${rHem} ${hemY} ` +
        // back up the right edge (reverse by symmetry: redraw mirrored edge)
        reversePath(sideEdge(1), round1(CX + waistHalf), bandBottom) +
        ' Z';

    // Reverses a "C x1 y1 x2 y2 x y ..." chain so it can be walked hem→waist.
    function reversePath(edge: string, endX: number, endY: number): string {
        const nums = edge
            .replace(/C/g, ' ')
            .trim()
            .split(/\s+/)
            .map(Number);
        // points: [c1,c2,p] triplets; walk backwards swapping control points
        const segs: string[] = [];
        const pts: Array<[number, number]> = [];
        for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
        // pts = c1,c2,p per segment; start point is the waistband edge
        const start: [number, number] = [endX, endY];
        const all = [start, ...pts];
        for (let seg = (all.length - 1) / 3; seg >= 1; seg--) {
            const p0 = all[(seg - 1) * 3];
            const c1 = all[(seg - 1) * 3 + 1];
            const c2 = all[(seg - 1) * 3 + 2];
            segs.push(`C ${c2[0]} ${c2[1]} ${c1[0]} ${c1[1]} ${p0[0]} ${p0[1]}`);
        }
        return segs.join(' ');
    }

    // --- Kali (panel) seams fanning from waist to hem ---
    const kali = m.kaliCount;
    const seams: string[] = [];
    // No seams on a plain column, and none on a fitted fishcut — panel
    // lines through the mermaid's curves read as clutter and can stray
    // outside the fitted outline.
    const showSeams = kali > 1 && silhouette !== 'straight' && silhouette !== 'mermaid';
    if (showSeams) {
        for (let i = 1; i < kali; i++) {
            const t = (i / kali) * 2 - 1; // -1..1 across the front
            const x0 = round1(CX + t * waistHalf * 0.92);
            const x1 = round1(CX + t * hemHalf * 0.94);
            const yEnd = round1(hemY + hemCurveDepth * (1 - t * t) * 0.7);
            const cx1 = round1(CX + t * hipHalf * 0.95);
            seams.push(`M ${x0} ${round1(bandBottom + 2)} Q ${cx1} ${hipY} ${x1} ${yEnd}`);
        }
    }
    const seamOpacity = silhouette === 'paneled' ? 0.3 : 0.12;
    const seamWidth = silhouette === 'paneled' ? 1.2 : 1;

    const embellished = embellishment !== 'plain';

    return (
        <figure className={className}>
            <svg
                viewBox={VIEW_BOX}
                role="img"
                aria-label="Illustrative front view of the customized lehenga"
                className="w-full h-auto"
            >
                <defs>
                    {embellishment === 'embroidery' && (
                        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
                            <path d="M4 22 Q10 8 16 14 T26 6" stroke={GOLD} strokeWidth="1.2" fill="none" />
                            <circle cx="20" cy="19" r="1.5" fill={GOLD} />
                        </pattern>
                    )}
                    {embellishment === 'zari' && (
                        <pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M0 10 L10 0" stroke={GOLD} strokeWidth="1.3" />
                            <path d="M-2 4 L4 -2" stroke={GOLD} strokeWidth="0.7" />
                        </pattern>
                    )}
                    {embellishment === 'sequin' && (
                        <pattern id={patternId} width="13" height="13" patternUnits="userSpaceOnUse">
                            <circle cx="4" cy="4" r="1.7" fill="#E9C85D" stroke="#B08F1F" strokeWidth="0.4" />
                            <circle cx="10.5" cy="10.5" r="1.7" fill="#E9C85D" stroke="#B08F1F" strokeWidth="0.4" />
                        </pattern>
                    )}
                    {embellishment === 'mirror' && (
                        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="12" cy="12" r="5.5" fill="#FDFDFD" stroke={GOLD} strokeWidth="1" />
                            <path d="M9 10 A4.5 4.5 0 0 1 12 7.5" stroke="#BBB" strokeWidth="1" fill="none" />
                        </pattern>
                    )}
                    {embellishment === 'stone' && (
                        <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
                            <rect x="6" y="6" width="6" height="6" transform="rotate(45 9 9)" fill="#FFFFFF" stroke="#B87A88" strokeWidth="0.7" />
                        </pattern>
                    )}
                </defs>

                {/* Skirt body */}
                <path d={skirtPath} fill={baseColor} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
                {embellished && <path d={skirtPath} fill={`url(#${patternId})`} opacity="0.55" />}

                {/* Kali seams */}
                {seams.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke="#000" opacity={seamOpacity} strokeWidth={seamWidth} />
                ))}

                {/* Waistband on top */}
                <rect
                    x={round1(CX - waistHalf)}
                    y={TOP}
                    width={round1(waistHalf * 2)}
                    height={bandH}
                    rx={2}
                    fill={baseColor}
                    stroke={OUTLINE}
                    strokeWidth="1.5"
                />
                <rect
                    x={round1(CX - waistHalf)}
                    y={TOP}
                    width={round1(waistHalf * 2)}
                    height={bandH}
                    rx={2}
                    fill="#000"
                    opacity="0.08"
                />

                {/* Closure hint */}
                {closure === 'side_zip' && (
                    <line
                        x1={round1(CX - waistHalf + 4)} y1={bandBottom + 2}
                        x2={round1(CX - waistHalf + 6)} y2={round1(bandBottom + 34)}
                        stroke={OUTLINE} strokeWidth="1.2" strokeDasharray="3 2.5" opacity="0.5"
                    />
                )}
                {closure === 'drawstring' && (
                    <g stroke={OUTLINE} strokeWidth="1.2" fill="none" opacity="0.65">
                        <path d={`M ${CX - 3} ${TOP + bandH} q -6 14 -3 26`} />
                        <path d={`M ${CX + 3} ${TOP + bandH} q 6 14 3 26`} />
                        <circle cx={CX - 6} cy={round1(TOP + bandH + 26)} r="2" fill={baseColor} />
                        <circle cx={CX + 6} cy={round1(TOP + bandH + 26)} r="2" fill={baseColor} />
                    </g>
                )}
                {closure === 'hook' && (
                    <g stroke={OUTLINE} strokeWidth="1.2" opacity="0.55">
                        <line x1={CX - 4} y1={round1(TOP + bandH / 2)} x2={CX + 4} y2={round1(TOP + bandH / 2)} />
                    </g>
                )}
            </svg>
            <figcaption className="text-xs text-warm-gray italic text-center mt-2">
                Illustrative preview — not to scale
            </figcaption>
        </figure>
    );
};

export default LehengaPreview;
