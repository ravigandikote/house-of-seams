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

export interface BlouseDesign extends BlouseDesignAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    // If used, must be a Supabase Storage URL (no fs uploads — see gap #2)
    thumbnailUrl?: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}
