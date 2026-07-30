// Single source of truth for lehenga style attributes (mirrors
// blouseDesign.ts). No DB table yet — v1 uses local sample designs; when
// lehenga_designs lands, its CHECK constraints must match these arrays.

import { Embellishment, EMBELLISHMENTS } from './blouseDesign';

export const LEHENGA_SILHOUETTES = ['a_line', 'circular', 'mermaid', 'straight', 'paneled'] as const;
export type LehengaSilhouette = (typeof LEHENGA_SILHOUETTES)[number];

export const LEHENGA_CLOSURES = ['side_zip', 'drawstring', 'hook'] as const;
export type LehengaClosure = (typeof LEHENGA_CLOSURES)[number];

// Embellishments and colours intentionally reuse the blouse value set.
export { EMBELLISHMENTS as LEHENGA_EMBELLISHMENTS };

// The subset that drives the SVG preview.
export interface LehengaDesignAttributes {
    silhouette: LehengaSilhouette;
    closure: LehengaClosure;
    embellishment: Embellishment;
    baseColor: string;
}

export interface LehengaDesign extends LehengaDesignAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    isActive: boolean;
    sortOrder: number;
}
