// Pure layout math for composed garment sketches (choli above skirt,
// kameez above salwar…). Lives in types/ so the category manifest and
// server-rendered pages can reference composition configs without
// importing client components — ComposedPreview consumes these.

/** Where and how large one garment sits inside the composition frame. */
export interface ComposedSlotConfig {
    key: string;
    /** Width of this garment as a percentage of the frame width. */
    widthPct: number;
    /** Top edge as a percentage of the frame height. */
    topPct: number;
    /** Horizontal shift of the garment's centre from the frame centre (%). */
    centerOffsetPct?: number;
    zIndex?: number;
}

/**
 * A garment's place in a top-to-bottom stack. Join lines are declared as
 * fractions of the garment's own rendered height (a blouse hem at ~0.94,
 * a skirt waist at ~0.04); anchorStack makes consecutive anchors meet.
 */
export interface AnchorStackEntry {
    key: string;
    widthPct: number;
    /** Child viewBox aspect as height ÷ width (BlousePreview: 240/300). */
    childAspect: number;
    /** Join line at the TOP of this garment (fraction of its height). */
    anchorTopFrac?: number;
    /** Join line at the BOTTOM of this garment (fraction of its height). */
    anchorBottomFrac?: number;
    centerOffsetPct?: number;
}

export interface AnchorStackOptions {
    /** Frame aspect (height ÷ width). */
    frameAspect: number;
    /** Top of the first garment as % of frame height. */
    startTopPct?: number;
}

/** Height of a child as a % of the frame height. */
function slotHeightPct(entry: AnchorStackEntry, frameAspect: number): number {
    return (entry.widthPct * entry.childAspect) / frameAspect;
}

export function anchorStack(
    entries: readonly AnchorStackEntry[],
    options: AnchorStackOptions
): ComposedSlotConfig[] {
    const { frameAspect, startTopPct = 2 } = options;
    const configs: ComposedSlotConfig[] = [];
    let prevTop = startTopPct;
    let prevHeight = 0;
    let prevBottomAnchor = 1;
    entries.forEach((entry, i) => {
        const height = slotHeightPct(entry, frameAspect);
        const top =
            i === 0
                ? startTopPct
                : prevTop + prevHeight * prevBottomAnchor - height * (entry.anchorTopFrac ?? 0);
        configs.push({
            key: entry.key,
            widthPct: entry.widthPct,
            topPct: top,
            centerOffsetPct: entry.centerOffsetPct,
            // Earlier (upper) garments draw on top so a choli hem overlaps
            // the skirt waistband naturally.
            zIndex: entries.length - i,
        });
        prevTop = top;
        prevHeight = height;
        prevBottomAnchor = entry.anchorBottomFrac ?? 1;
    });
    return configs;
}
