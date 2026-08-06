// Single source of truth for kurti/kameez style attributes. Where a value
// set is identical to the blouse's it is IMPORTED, never duplicated —
// sleeves and embellishments are the blouse enums; necklines extend the
// blouse set with kurti-specific collars.

import {
    Embellishment,
    EMBELLISHMENTS,
    NECK_STYLES,
    SLEEVE_STYLES,
    SleeveStyle,
} from './blouseDesign';

export const KURTI_CUTS = ['straight', 'a_line', 'flared'] as const;
export type KurtiCut = (typeof KURTI_CUTS)[number];

export const KURTI_SLITS = ['side_slits', 'front_slit', 'none'] as const;
export type KurtiSlit = (typeof KURTI_SLITS)[number];

// Blouse necklines plus collar styles that only make sense on a kurti.
export const KURTI_NECKLINES = [...NECK_STYLES, 'band', 'mandarin', 'shirt'] as const;
export type KurtiNeckline = (typeof KURTI_NECKLINES)[number];

export { SLEEVE_STYLES as KURTI_SLEEVES, EMBELLISHMENTS as KURTI_EMBELLISHMENTS };

export interface KurtiDesignAttributes {
    cut: KurtiCut;
    slit: KurtiSlit;
    neckline: KurtiNeckline;
    sleeveStyle: SleeveStyle;
    embellishment: Embellishment;
    baseColor: string;
}
