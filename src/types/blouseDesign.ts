// Single source of truth for the blouse-design style attributes.
// The admin form dropdowns and the SVG preview renderer both import
// these arrays; the CHECK constraints in
// supabase/migrations/002_blouse_customizer.sql must stay in sync.

export const NECK_STYLES = ['round', 'v', 'sweetheart', 'high', 'boat', 'square'] as const;
export type NeckStyle = (typeof NECK_STYLES)[number];

export const BACK_STYLES = ['round', 'deep-round', 'v', 'keyhole', 'tie'] as const;
export type BackStyle = (typeof BACK_STYLES)[number];

export const SLEEVE_STYLES = ['sleeveless', 'cap', 'short', 'elbow', 'three-quarter', 'full'] as const;
export type SleeveStyle = (typeof SLEEVE_STYLES)[number];

// Typical sleeve length (inches) per style. The preview clamps the
// customer's sleeveLength measurement into the chosen style's range so
// both the style AND the measurement visibly affect the drawing.
export const SLEEVE_LENGTH_BOUNDS: Record<SleeveStyle, { min: number; max: number }> = {
    sleeveless: { min: 0, max: 0 },
    cap: { min: 1, max: 3 },
    short: { min: 3, max: 8 },
    elbow: { min: 8, max: 13 },
    'three-quarter': { min: 13, max: 18 },
    full: { min: 18, max: 24 },
};

export const CLOSURES = ['hook', 'zip', 'tie', 'button'] as const;
export type Closure = (typeof CLOSURES)[number];

export const EMBELLISHMENTS = ['plain', 'embroidery', 'zari', 'sequin', 'mirror', 'stone'] as const;
export type Embellishment = (typeof EMBELLISHMENTS)[number];

// The subset of a design that drives the SVG preview (and is
// denormalised into custom_design_requests.design_snapshot).
export interface BlouseDesignAttributes {
    neckStyle: NeckStyle;
    backStyle: BackStyle;
    sleeveStyle: SleeveStyle;
    closure: Closure;
    embellishment: Embellishment;
    baseColor: string;
}

// Per-design variation whitelist. Every key is optional and an absent or
// empty list means "every option allowed" — which is how the legacy rows
// (allowed_variations IS NULL) keep offering the full range.
export interface BlouseAllowedVariations {
    sleeves?: SleeveStyle[];
    necklines?: NeckStyle[];
    backs?: BackStyle[];
}

// The attribute each variation key constrains, so UI and validation can
// iterate the three keys instead of repeating them.
export const VARIATION_KEYS = ['sleeves', 'necklines', 'backs'] as const;
export type VariationKey = (typeof VARIATION_KEYS)[number];

export const VARIATION_OPTIONS: Record<VariationKey, readonly string[]> = {
    sleeves: SLEEVE_STYLES,
    necklines: NECK_STYLES,
    backs: BACK_STYLES,
};

export interface BlouseDesign extends BlouseDesignAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    // If used, must be a Supabase Storage URL (no fs uploads — see gap #2)
    thumbnailUrl?: string | null;
    isActive: boolean;
    sortOrder: number;
    /** Kavya's signature cuts lead the customizer gallery. */
    isSignature: boolean;
    /** null = this design is offered in every sleeve/neck/back style. */
    allowedVariations?: BlouseAllowedVariations | null;
    createdAt?: string;
    updatedAt?: string;
}

// The options a design offers for one variation key. An unset or empty
// list means every option, so callers never special-case legacy rows.
export function allowedOptionsFor(
    design: Pick<BlouseDesign, 'allowedVariations'> | null | undefined,
    key: VariationKey,
): readonly string[] {
    const all = VARIATION_OPTIONS[key];
    const allowed = design?.allowedVariations?.[key];
    if (!allowed || allowed.length === 0) return all;
    const filtered = all.filter((option) => (allowed as readonly string[]).includes(option));
    // A list that filters everything out is a data error, not an intent to
    // offer nothing — fall back to the full range rather than a dead step.
    return filtered.length > 0 ? filtered : all;
}

// Immutably set (or clear, with null) one key. Each key holds its own
// style union, so the branches replace a cast on a generic index write.
// Values must already be validated members of that key's enum.
export function withVariation(
    current: BlouseAllowedVariations | null | undefined,
    key: VariationKey,
    values: readonly string[] | null,
): BlouseAllowedVariations {
    const next: BlouseAllowedVariations = { ...(current ?? {}) };
    if (values === null) {
        delete next[key];
    } else if (key === 'sleeves') {
        next.sleeves = values as SleeveStyle[];
    } else if (key === 'necklines') {
        next.necklines = values as NeckStyle[];
    } else {
        next.backs = values as BackStyle[];
    }
    return next;
}
