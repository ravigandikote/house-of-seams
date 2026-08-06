// Single source of truth for bottoms style attributes (salwar, churidar,
// palazzo, straight pants). Mirrors blouseDesign.ts / kurtiDesign.ts.

export const BOTTOM_STYLES = ['salwar', 'churidar', 'palazzo', 'straight_pant'] as const;
export type BottomStyle = (typeof BOTTOM_STYLES)[number];

export const WAISTBANDS = ['drawstring', 'elastic', 'hook'] as const;
export type Waistband = (typeof WAISTBANDS)[number];

// Pleats are a salwar signature; the renderer only draws them for salwar.
export const BOTTOM_PLEATS = ['none', 'pleated'] as const;
export type BottomPleats = (typeof BOTTOM_PLEATS)[number];

export interface BottomsDesignAttributes {
    bottomStyle: BottomStyle;
    waistband: Waistband;
    pleats: BottomPleats;
    baseColor: string;
}
