// Sewing-pattern profiles: OUR presentation layer for purchasable
// patterns. Shopify is the source of truth for price/availability/
// delivery; a profile joins to its Shopify product by shopify_handle at
// runtime. A profile whose handle has no product yet renders as
// "coming soon" — never an error.

import { CommerceProduct } from './commerce';
import { RendererId } from './customizerCategories';

export const PATTERN_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type PatternDifficulty = (typeof PATTERN_DIFFICULTIES)[number];

// Customizer category slugs + 'foundational' — mirrors the CHECK in
// 011_pattern_profiles.sql.
export const PATTERN_CATEGORIES = [
    'blouse',
    'lehenga',
    'kurti',
    'bottoms',
    'salwar_suit',
    'anarkali',
    'langa_voni',
    'pattu_pavadai',
    'gown',
    'petticoat',
    'foundational',
] as const;
export type PatternCategory = (typeof PATTERN_CATEGORIES)[number];

export interface PatternFormats {
    a4: boolean;
    a0: boolean;
    projector: boolean;
}

/** Which renderer draws the card sketch, and with what style attributes. */
export interface PatternPreviewConfig {
    renderer: RendererId;
    style: Record<string, string>;
}

export interface PatternProfile {
    id: string;
    shopifyHandle: string;
    title: string;
    category: PatternCategory;
    patternType: string;
    difficulty: PatternDifficulty;
    sizeRange: string;
    formats: PatternFormats;
    fabricNotes?: string | null;
    whatsIncluded: string[];
    previewConfig: PatternPreviewConfig;
    relatedDesignSlugs: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export const DIFFICULTY_LABELS: Record<PatternDifficulty, string> = {
    beginner: 'Beginner friendly',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export function formatLabels(formats: PatternFormats): string[] {
    const labels: string[] = [];
    if (formats.a4) labels.push('A4 print-at-home');
    if (formats.a0) labels.push('A0 copy-shop');
    if (formats.projector) labels.push('Projector file');
    return labels;
}

/** A profile joined with its live Shopify product (null → coming soon). */
export interface PatternListing {
    profile: PatternProfile;
    product: CommerceProduct | null;
}
