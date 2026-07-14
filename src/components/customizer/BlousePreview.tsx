'use client';

import React, { useId } from 'react';
import { BlouseDesignAttributes, SLEEVE_LENGTH_BOUNDS } from '../../types/blouseDesign';
import {
    Measurements,
    MeasurementField,
    MEASUREMENT_FIELDS,
    MEASUREMENT_RANGES,
} from '../../types/measurements';

// Parametric SVG blouse preview. Design attributes drive the STYLE
// (neckline shape, sleeves, embellishment pattern, colour); measurements
// drive the GEOMETRY (widths, lengths, depths). This component is
// deliberately self-contained and swappable — a layered-image or
// AI-generated renderer could later replace it behind the same props.

export interface BlousePreviewProps {
    design: BlouseDesignAttributes;
    measurements: Measurements;
    view: 'front' | 'back';
    className?: string;
}

// 6 SVG units per inch on a fixed canvas, so measurement changes are
// visibly proportional. Canvas sized to fit the max clamped measurements.
const S = 6;
const CX = 150; // horizontal centre
const TOP = 42; // y of the neck/shoulder line
const SLOPE = 8; // shoulder slope
const VIEW_BOX = '0 0 300 240';

const OUTLINE = '#2D2D2D'; // charcoal
const GOLD = '#C9A227'; // zari / embellishment accents

const round1 = (n: number): number => Math.round(n * 10) / 10;

function clampField(field: MeasurementField, value: number): number {
    const { min, max } = MEASUREMENT_RANGES[field];
    if (!Number.isFinite(value)) return (min + max) / 2;
    return Math.min(max, Math.max(min, value));
}

// The neckline shapes we can draw. Front and back styles both map onto
// these (keyhole/tie add extra decoration on top of a round opening).
type NeckShape = 'round' | 'v' | 'sweetheart' | 'square';

interface NeckConfig {
    shape: NeckShape;
    depthFactor: number;
    wide?: boolean; // boat neck: wider, shallower opening
}

const FRONT_NECK_CONFIG: Record<BlouseDesignAttributes['neckStyle'], NeckConfig> = {
    round: { shape: 'round', depthFactor: 1 },
    v: { shape: 'v', depthFactor: 1 },
    sweetheart: { shape: 'sweetheart', depthFactor: 1 },
    high: { shape: 'round', depthFactor: 0.35 },
    boat: { shape: 'round', depthFactor: 0.4, wide: true },
    square: { shape: 'square', depthFactor: 0.9 },
};

const BACK_NECK_CONFIG: Record<BlouseDesignAttributes['backStyle'], NeckConfig> = {
    round: { shape: 'round', depthFactor: 1 },
    'deep-round': { shape: 'round', depthFactor: 1.3 },
    v: { shape: 'v', depthFactor: 1.1 },
    keyhole: { shape: 'round', depthFactor: 0.5 },
    tie: { shape: 'round', depthFactor: 1.25 },
};

// Path segment from the RIGHT neck point back to the LEFT neck point,
// dipping to `depth`. Closes the body outline.
function necklineSegment(shape: NeckShape, halfW: number, depth: number): string {
    const l = round1(CX - halfW);
    const r = round1(CX + halfW);
    const t = TOP;
    const bottom = round1(t + depth);
    switch (shape) {
        case 'v':
            return `L ${CX} ${bottom} L ${l} ${t}`;
        case 'square':
            return `L ${r} ${bottom} L ${l} ${bottom} L ${l} ${t}`;
        case 'sweetheart': {
            // Two lobes meeting in a soft cusp at the centre-bottom.
            const lobeY = round1(t + depth * 0.6);
            const edgeY = round1(t + depth * 0.75);
            const inL = round1(CX - halfW * 0.35);
            const inR = round1(CX + halfW * 0.35);
            return (
                `C ${r} ${edgeY} ${inR} ${lobeY} ${CX} ${bottom} ` +
                `C ${inL} ${lobeY} ${l} ${edgeY} ${l} ${t}`
            );
        }
        case 'round':
        default: {
            // Cubic whose lowest point sits at `depth`.
            const ctrlY = round1(t + depth * 1.33);
            return `C ${r} ${ctrlY} ${l} ${ctrlY} ${l} ${t}`;
        }
    }
}

const BlousePreview: React.FC<BlousePreviewProps> = ({ design, measurements, view, className }) => {
    // Unique pattern ids so multiple previews can coexist on one page.
    const uid = useId().replace(/[:]/g, '');
    const patternId = `blouse-pat-${uid}`;

    // Clamp every measurement to its sane range so extreme or partial
    // input never breaks the drawing.
    const m = {} as Measurements;
    for (const field of MEASUREMENT_FIELDS) {
        m[field] = clampField(field, measurements[field]);
    }

    // --- Geometry (all in SVG units) ---
    const halfShoulder = round1((m.shoulderWidth / 2) * S);
    // Front panel width is roughly a quarter of the bust/waist circumference
    // per half. Floors keep degenerate combinations drawable.
    const halfBust = round1(Math.max((m.bust / 4) * S, halfShoulder * 0.7));
    const halfWaist = round1(Math.max((m.waist / 4) * S, 22));
    const bodyH = m.blouseLength * S;
    const hemY = round1(TOP + bodyH);
    const shoulderY = TOP + SLOPE;
    const underarmY = round1(Math.min(shoulderY + m.armhole * 0.36 * S, TOP + bodyH * 0.62));

    // --- Neckline ---
    const neckConfig = view === 'front' ? FRONT_NECK_CONFIG[design.neckStyle] : BACK_NECK_CONFIG[design.backStyle];
    const neckHalf = round1(neckConfig.wide ? halfShoulder * 0.78 : Math.min(halfShoulder * 0.5, 26));
    const rawDepth = (view === 'front' ? m.frontNeckDepth : m.backNeckDepth) * S;
    const neckDepth = round1(Math.min(rawDepth * neckConfig.depthFactor, bodyH * 0.55));
    const neckBottomY = TOP + neckDepth;

    // --- Body outline (sleeves are drawn separately, behind it) ---
    const lSh = round1(CX - halfShoulder);
    const rSh = round1(CX + halfShoulder);
    const armCtrl1Y = round1(shoulderY + (underarmY - shoulderY) * 0.45);
    const armCtrl2Y = round1(underarmY - (underarmY - shoulderY) * 0.3);
    const sideCtrl1Y = round1(underarmY + (hemY - underarmY) * 0.45);
    const sideCtrl2Y = round1(hemY - (hemY - underarmY) * 0.35);
    const bodyPath = [
        `M ${round1(CX - neckHalf)} ${TOP}`,
        `L ${lSh} ${shoulderY}`,
        `C ${round1(lSh - 2)} ${armCtrl1Y} ${round1(CX - halfBust)} ${armCtrl2Y} ${round1(CX - halfBust)} ${underarmY}`,
        `C ${round1(CX - halfBust)} ${sideCtrl1Y} ${round1(CX - halfWaist)} ${sideCtrl2Y} ${round1(CX - halfWaist)} ${hemY}`,
        `L ${round1(CX + halfWaist)} ${hemY}`,
        `C ${round1(CX + halfWaist)} ${sideCtrl2Y} ${round1(CX + halfBust)} ${sideCtrl1Y} ${round1(CX + halfBust)} ${underarmY}`,
        `C ${round1(CX + halfBust)} ${armCtrl2Y} ${round1(rSh + 2)} ${armCtrl1Y} ${rSh} ${shoulderY}`,
        `L ${round1(CX + neckHalf)} ${TOP}`,
        necklineSegment(neckConfig.shape, neckHalf, neckDepth),
        'Z',
    ].join(' ');

    // --- Sleeves ---
    const sleeveBounds = SLEEVE_LENGTH_BOUNDS[design.sleeveStyle];
    const sleeveLen =
        Math.min(sleeveBounds.max, Math.max(sleeveBounds.min, m.sleeveLength)) * S;
    const showSleeves = design.sleeveStyle !== 'sleeveless' && sleeveLen > 2;
    // Arm direction: down and slightly outward. The sleeve is a band from
    // the armhole line (shoulder point -> underarm point) extruded along
    // the arm axis, with a cuff perpendicular to it — this stays a simple
    // (non-self-intersecting) polygon for all measurement combinations.
    const DX = 0.3;
    const DY = 0.95;
    // Long sleeves taper toward the wrist.
    const cuffTaper = design.sleeveStyle === 'full' || design.sleeveStyle === 'three-quarter' ? 0.55 : 0.75;

    function sleevePath(side: -1 | 1): string {
        const px = side === -1 ? lSh : rSh; // shoulder point
        const py = shoulderY;
        const ux = round1(CX + side * halfBust); // underarm point
        const uy = underarmY;
        const armholeLen = Math.hypot(ux - px, uy - py);
        // Cuff centre sits sleeveLen from the shoulder along the arm,
        // measured from the armhole midpoint.
        const axisLen = Math.max(sleeveLen - armholeLen / 2, 5);
        const mx = (px + ux) / 2;
        const my = (py + uy) / 2;
        const ccx = mx + side * DX * axisLen;
        const ccy = my + DY * axisLen;
        const w = Math.max(armholeLen * cuffTaper, 10);
        // Perpendicular to the arm axis, pointing away from the body.
        const perpX = side * 0.95;
        const perpY = -0.3;
        const bx = round1(ccx + (perpX * w) / 2); // outer cuff corner
        const by = round1(ccy + (perpY * w) / 2);
        const ix = round1(ccx - (perpX * w) / 2); // inner cuff corner
        const iy = round1(ccy - (perpY * w) / 2);
        // Outer edge bulges gently outward.
        const outCtrlX = round1(px + side * DX * axisLen * 0.4 + perpX * w * 0.55);
        const outCtrlY = round1(py + DY * axisLen * 0.45);
        // Cuff sags slightly along the arm direction.
        const cuffCtrlX = round1((bx + ix) / 2 + side * DX * 5);
        const cuffCtrlY = round1((by + iy) / 2 + DY * 5);
        return (
            `M ${round1(px)} ${round1(py)} ` +
            `Q ${outCtrlX} ${outCtrlY} ${bx} ${by} ` +
            `Q ${cuffCtrlX} ${cuffCtrlY} ${ix} ${iy} ` +
            `L ${ux} ${uy} Z`
        );
    }

    // --- Princess seam detail lines ---
    function seamPath(side: -1 | 1): string {
        const x1 = round1(CX + side * halfShoulder * 0.5);
        const cxQ = round1(CX + side * halfBust * 0.62);
        const x2 = round1(CX + side * halfWaist * 0.55);
        return `M ${x1} ${round1(shoulderY + 4)} Q ${cxQ} ${round1(underarmY + 10)} ${x2} ${round1(hemY - 1)}`;
    }

    // --- Closure markers (front view only; 'tie' shows nothing) ---
    const closureStartY = neckBottomY + 10;
    const closureEndY = hemY - 8;
    const showClosure = view === 'front' && design.closure !== 'tie' && closureEndY - closureStartY > 20;
    const closureYs: number[] = [];
    if (showClosure) {
        const count = Math.max(3, Math.floor((closureEndY - closureStartY) / 16));
        for (let i = 0; i <= count; i++) {
            closureYs.push(round1(closureStartY + ((closureEndY - closureStartY) * i) / count));
        }
    }

    const embellished = design.embellishment !== 'plain';

    return (
        <figure className={className}>
            <svg
                viewBox={VIEW_BOX}
                role="img"
                aria-label={`Illustrative ${view} view of the customized blouse`}
                className="w-full h-auto"
            >
                <defs>
                    {design.embellishment === 'embroidery' && (
                        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
                            <path d="M4 22 Q10 8 16 14 T26 6" stroke={GOLD} strokeWidth="1.2" fill="none" />
                            <circle cx="20" cy="19" r="1.5" fill={GOLD} />
                        </pattern>
                    )}
                    {design.embellishment === 'zari' && (
                        <pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M0 10 L10 0" stroke={GOLD} strokeWidth="1.3" />
                            <path d="M-2 4 L4 -2" stroke={GOLD} strokeWidth="0.7" />
                        </pattern>
                    )}
                    {design.embellishment === 'sequin' && (
                        <pattern id={patternId} width="13" height="13" patternUnits="userSpaceOnUse">
                            <circle cx="4" cy="4" r="1.7" fill="#E9C85D" stroke="#B08F1F" strokeWidth="0.4" />
                            <circle cx="10.5" cy="10.5" r="1.7" fill="#E9C85D" stroke="#B08F1F" strokeWidth="0.4" />
                        </pattern>
                    )}
                    {design.embellishment === 'mirror' && (
                        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="12" cy="12" r="5.5" fill="#FDFDFD" stroke={GOLD} strokeWidth="1" />
                            <path d="M9 10 A4.5 4.5 0 0 1 12 7.5" stroke="#BBB" strokeWidth="1" fill="none" />
                        </pattern>
                    )}
                    {design.embellishment === 'stone' && (
                        <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
                            <rect x="6" y="6" width="6" height="6" transform="rotate(45 9 9)" fill="#FFFFFF" stroke="#B87A88" strokeWidth="0.7" />
                        </pattern>
                    )}
                </defs>

                {/* Sleeves (behind the body) */}
                {showSleeves && (
                    <g>
                        <path d={sleevePath(-1)} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
                        <path d={sleevePath(1)} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
                        {/* subtle shading so sleeves read behind the body */}
                        <path d={sleevePath(-1)} fill="#000" opacity="0.08" />
                        <path d={sleevePath(1)} fill="#000" opacity="0.08" />
                        {embellished && (
                            <g opacity="0.5">
                                <path d={sleevePath(-1)} fill={`url(#${patternId})`} />
                                <path d={sleevePath(1)} fill={`url(#${patternId})`} />
                            </g>
                        )}
                    </g>
                )}

                {/* Body */}
                <path d={bodyPath} fill={design.baseColor} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
                {embellished && <path d={bodyPath} fill={`url(#${patternId})`} opacity="0.55" />}

                {/* Princess seams */}
                <path d={seamPath(-1)} stroke="rgba(0,0,0,0.14)" strokeWidth="1" fill="none" />
                <path d={seamPath(1)} stroke="rgba(0,0,0,0.14)" strokeWidth="1" fill="none" />

                {/* Closure markers (front) */}
                {showClosure && design.closure === 'zip' && (
                    <line x1={CX} y1={closureStartY} x2={CX} y2={closureEndY} stroke={OUTLINE} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.55" />
                )}
                {showClosure && design.closure === 'hook' && closureYs.map((y) => (
                    <line key={y} x1={CX - 4} y1={y} x2={CX + 4} y2={y} stroke={OUTLINE} strokeWidth="1.2" opacity="0.5" />
                ))}
                {showClosure && design.closure === 'button' && closureYs.map((y) => (
                    <circle key={y} cx={CX} cy={y} r="2.4" fill="#FFF" stroke={OUTLINE} strokeWidth="1" opacity="0.7" />
                ))}

                {/* Back-only decorations */}
                {view === 'back' && design.backStyle === 'keyhole' && (
                    <path
                        d={`M ${CX} ${round1(neckBottomY - 1)} q 7 12 0 20 q -7 -8 0 -20 Z`}
                        fill="none"
                        stroke={OUTLINE}
                        strokeWidth="1.3"
                    />
                )}
                {view === 'back' && design.backStyle === 'tie' && (
                    <g stroke={OUTLINE} strokeWidth="1.2" fill="none" opacity="0.75">
                        {/* knot + two hanging tie strings in the back opening */}
                        <circle cx={CX} cy={round1(neckBottomY + 1)} r="2.5" fill={design.baseColor} />
                        <path d={`M ${CX - 2} ${round1(neckBottomY + 3)} q -5 10 -2 22`} />
                        <path d={`M ${CX + 2} ${round1(neckBottomY + 3)} q 5 10 2 22`} />
                    </g>
                )}
            </svg>
            <figcaption className="text-xs text-warm-gray italic text-center mt-2">
                Illustrative preview — not to scale
            </figcaption>
        </figure>
    );
};

export default BlousePreview;
