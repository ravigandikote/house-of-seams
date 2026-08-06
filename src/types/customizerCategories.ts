// THE category manifest — the single place a garment category is
// registered. Adding a category = a spec file + a styles file + a
// renderer (or a composition of existing ones) + ONE entry here.
// The customizer cards/pills, /dev/preview, the admin Designs section,
// and the server-side style validator are all driven from this file.
//
// Renderers are referenced by id (never by component) so this module
// stays importable from server code; components/customizer/
// rendererRegistry.tsx maps ids → React components on the client.

import { CategoryMeasurementSpec } from './measurementSpec';
import { AnchorStackEntry } from './composition';
import { BLOUSE_MEASUREMENT_SPEC } from './measurements';
import { LEHENGA_MEASUREMENT_SPEC } from './lehengaMeasurements';
import { KURTI_MEASUREMENT_SPEC } from './kurtiMeasurements';
import { BOTTOMS_MEASUREMENT_SPEC } from './bottomsMeasurements';
import { SALWAR_SUIT_MEASUREMENT_SPEC } from './salwarSuitMeasurements';
import {
    BACK_STYLES,
    CLOSURES,
    EMBELLISHMENTS,
    NECK_STYLES,
    SLEEVE_STYLES,
} from './blouseDesign';
import { LEHENGA_CLOSURES, LEHENGA_SILHOUETTES } from './lehengaDesign';
import { KURTI_CUTS, KURTI_NECKLINES, KURTI_SLITS } from './kurtiDesign';
import { BOTTOM_PLEATS, BOTTOM_STYLES, WAISTBANDS } from './bottomsDesign';

export type RendererId = 'blouse' | 'lehenga' | 'kurti' | 'bottoms';

export type RendererConfig =
    | { kind: 'single'; rendererId: RendererId }
    | {
          kind: 'composed';
          /** Frame aspect (height ÷ width) shared by every render surface. */
          frameAspect: number;
          /** Top-to-bottom stack; slot keys map to garment renderers. */
          stack: readonly (AnchorStackEntry & { rendererId: RendererId })[];
      };

export interface CustomizerCategory {
    id: string;
    label: string;
    /** Short factual line (pills tooltip, coming-soon cards). */
    description: string;
    /** Poetic one-liner revealed on the category card. */
    tagline: string;
    available: boolean;
    /** Measurement spec, when the category's journey is built. */
    spec: CategoryMeasurementSpec | null;
    /** Style attribute enums — drives admin design forms AND the
     *  server-side garment_designs validator. Keys mirror the JSONB. */
    styleEnums: Record<string, readonly string[]> | null;
    renderer: RendererConfig | null;
    /** Where this category's pickable designs live. */
    designSource: 'blouse_designs' | 'garment_designs' | 'local_samples' | null;
    /** Occasion tags for the future occasion-first entry point. */
    occasionTags: readonly string[];
    /** Which measurement_defaults bracket family prefills by age. */
    bracketSet: 'adult' | null;
    /** Spec-sheet highlight fields (atelier key numbers); defaults to the
     *  first six recorded fields when omitted. */
    keyFields?: readonly string[];
}

export const CUSTOMIZER_CATEGORIES: readonly CustomizerCategory[] = [
    {
        id: 'blouse',
        label: 'Blouse',
        description: 'Custom-fitted saree blouses',
        tagline: 'Tailored to the last quarter-inch — your blouse, your story.',
        available: true,
        spec: BLOUSE_MEASUREMENT_SPEC,
        styleEnums: {
            neckStyle: NECK_STYLES,
            backStyle: BACK_STYLES,
            sleeveStyle: SLEEVE_STYLES,
            closure: CLOSURES,
            embellishment: EMBELLISHMENTS,
        },
        renderer: { kind: 'single', rendererId: 'blouse' },
        designSource: 'blouse_designs',
        occasionTags: ['wedding', 'festive', 'daily'],
        bracketSet: 'adult',
    },
    {
        id: 'lehenga',
        label: 'Lehenga',
        description: 'Custom lehenga skirts, designed and measured to you',
        tagline: 'Twirl-worthy gheras, stitched to your silhouette.',
        available: true,
        spec: LEHENGA_MEASUREMENT_SPEC,
        styleEnums: {
            silhouette: LEHENGA_SILHOUETTES,
            closure: LEHENGA_CLOSURES,
            embellishment: EMBELLISHMENTS,
        },
        renderer: { kind: 'single', rendererId: 'lehenga' },
        designSource: 'garment_designs',
        occasionTags: ['wedding', 'reception', 'festive'],
        bracketSet: null,
    },
    {
        id: 'kurti',
        label: 'Kurti / Kameez',
        description: 'Custom kurtis and kameez — straight, A-line, or flared',
        tagline: 'From office mornings to mehendi evenings — one perfect fit.',
        available: true,
        spec: KURTI_MEASUREMENT_SPEC,
        styleEnums: {
            cut: KURTI_CUTS,
            slit: KURTI_SLITS,
            neckline: KURTI_NECKLINES,
            sleeveStyle: SLEEVE_STYLES,
            embellishment: EMBELLISHMENTS,
        },
        renderer: { kind: 'single', rendererId: 'kurti' },
        designSource: 'garment_designs',
        occasionTags: ['daily', 'office', 'festive'],
        bracketSet: 'adult',
        keyFields: ['bust', 'waistRound', 'hipRound', 'kurtiLength', 'hemRound', 'sleeveLength'],
    },
    {
        id: 'salwar_suit',
        label: 'Salwar Suit',
        description: 'A complete suit — kameez, bottoms, and dupatta, cut as one',
        tagline: 'Kameez, bottoms, dupatta — one story, told in three pieces.',
        available: true,
        spec: SALWAR_SUIT_MEASUREMENT_SPEC,
        // Custom composed journey — styles validate per garment in the
        // dedicated submit branch, not via the generic enum map.
        styleEnums: null,
        renderer: {
            kind: 'composed',
            frameAspect: 0.85,
            stack: [
                { key: 'kameez', rendererId: 'kurti', widthPct: 100, childAspect: 220 / 300, anchorBottomFrac: 0.366 },
                { key: 'bottoms', rendererId: 'bottoms', widthPct: 90, childAspect: 200 / 300, anchorTopFrac: 0.08 },
            ],
        },
        designSource: null,
        occasionTags: ['daily', 'office', 'festive'],
        bracketSet: 'adult',
        keyFields: ['bust', 'waistRound', 'hipRound', 'kurtiLength', 'bottomLength', 'bottomOpening'],
    },
    {
        id: 'bottoms',
        label: 'Bottoms',
        description: 'Salwars, churidars, palazzos, and straight pants — made to measure',
        tagline: 'The quiet half of every great outfit, finally cut to you.',
        available: true,
        spec: BOTTOMS_MEASUREMENT_SPEC,
        styleEnums: {
            bottomStyle: BOTTOM_STYLES,
            waistband: WAISTBANDS,
            pleats: BOTTOM_PLEATS,
        },
        renderer: { kind: 'single', rendererId: 'bottoms' },
        designSource: 'garment_designs',
        occasionTags: ['daily', 'office'],
        bracketSet: null,
        keyFields: ['waistRound', 'hipRound', 'bottomLength', 'bottomOpening', 'thighRound'],
    },
    {
        id: 'shirt',
        label: 'Shirts',
        description: 'Coming soon',
        tagline: 'Joining the atelier soon.',
        available: false,
        spec: null,
        styleEnums: null,
        renderer: null,
        designSource: null,
        occasionTags: [],
        bracketSet: null,
    },
    {
        id: 'trousers',
        label: 'Trousers',
        description: 'Coming soon',
        tagline: 'Joining the atelier soon.',
        available: false,
        spec: null,
        styleEnums: null,
        renderer: null,
        designSource: null,
        occasionTags: [],
        bracketSet: null,
    },
];

export function categoryById(id: string): CustomizerCategory | undefined {
    return CUSTOMIZER_CATEGORIES.find((c) => c.id === id);
}

/** Categories whose pickable designs live in garment_designs. */
export function garmentDesignCategories(): CustomizerCategory[] {
    return CUSTOMIZER_CATEGORIES.filter((c) => c.designSource === 'garment_designs');
}
