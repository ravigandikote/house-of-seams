// Server-side data layer for the Pattern Shop: Supabase pattern_profiles
// (presentation) joined at runtime with Shopify products (price,
// availability, checkout) on shopify_handle. Degrades gracefully twice
// over: site demo mode (no Supabase) falls back to a small profile set;
// commerce demo mode (no Shopify) prices from the demo fixtures — and a
// profile with no product either way renders as "coming soon".

import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import {
    demoProducts,
    getProductsByHandles,
    isCommerceConfigured,
} from '@/lib/shopify';
import { CommerceProduct, Region } from '@/types/commerce';
import { PatternListing, PatternProfile } from '@/types/pattern';

export type { PatternListing };

// Site-demo-mode fallback profiles — matches the commerce demo fixtures
// so both demo layers line up.
const FALLBACK_PROFILES: PatternProfile[] = [
    {
        id: 'fallback-pattern-1',
        shopifyHandle: 'princess-cut-blouse-pattern',
        title: 'Princess Cut Blouse',
        category: 'blouse',
        patternType: 'princess_cut',
        difficulty: 'intermediate',
        sizeRange: '32–44 bust',
        formats: { a4: true, a0: true, projector: false },
        fabricNotes: 'Best in cottons, brocades, and stable silks.',
        whatsIncluded: ['Layered PDF pattern', 'Step-by-step photo instructions', 'Fabric & notions chart'],
        previewConfig: { renderer: 'blouse', style: { neckStyle: 'round', backStyle: 'round', sleeveStyle: 'short', closure: 'hook', embellishment: 'plain', baseColor: '#D6A6B1' } },
        relatedDesignSlugs: ['classic-round'],
        isActive: true,
        sortOrder: 1,
    },
    {
        id: 'fallback-pattern-2',
        shopifyHandle: 'kalidar-lehenga-8-pattern',
        title: '8-Kali Lehenga Skirt',
        category: 'lehenga',
        patternType: 'kalidar_8',
        difficulty: 'intermediate',
        sizeRange: 'Waist 26–44',
        formats: { a4: true, a0: true, projector: false },
        fabricNotes: 'Silks, georgettes, and heavier festive weaves.',
        whatsIncluded: ['Layered PDF pattern', 'Kali assembly guide', 'Can-can & lining notes'],
        previewConfig: { renderer: 'lehenga', style: { silhouette: 'paneled', closure: 'side_zip', embellishment: 'plain', baseColor: '#8FA88D' } },
        relatedDesignSlugs: ['paneled-heritage'],
        isActive: true,
        sortOrder: 2,
    },
    {
        id: 'fallback-pattern-3',
        shopifyHandle: 'straight-kurti-pattern',
        title: 'Straight Kurti',
        category: 'kurti',
        patternType: 'straight',
        difficulty: 'beginner',
        sizeRange: 'XS–3XL',
        formats: { a4: true, a0: true, projector: true },
        fabricNotes: 'Cottons, rayons, and linen blends.',
        whatsIncluded: ['Layered PDF pattern', 'Three neckline options', 'Illustrated instructions'],
        previewConfig: { renderer: 'kurti', style: { cut: 'straight', slit: 'side_slits', neckline: 'round', sleeveStyle: 'three-quarter', embellishment: 'plain', baseColor: '#B7C9B5' } },
        relatedDesignSlugs: ['everyday-straight'],
        isActive: true,
        sortOrder: 3,
    },
    {
        id: 'fallback-pattern-4',
        shopifyHandle: 'bodice-block-pattern',
        title: 'Personal Bodice Block',
        category: 'foundational',
        patternType: 'bodice_block',
        difficulty: 'advanced',
        sizeRange: 'Drafted to your measurements',
        formats: { a4: true, a0: false, projector: false },
        fabricNotes: 'Draft in muslin/calico first.',
        whatsIncluded: ['Draft-along instructions', 'Measurement worksheet', 'Fitting troubleshooting guide'],
        previewConfig: { renderer: 'blouse', style: { neckStyle: 'high', backStyle: 'round', sleeveStyle: 'sleeveless', closure: 'hook', embellishment: 'plain', baseColor: '#E7D3AC' } },
        relatedDesignSlugs: [],
        isActive: true,
        sortOrder: 4,
    },
];

export async function getPatternProfiles(): Promise<PatternProfile[]> {
    const supabase = createClient();
    if (!supabase) return FALLBACK_PROFILES;
    const { data, error } = await supabase
        .from('pattern_profiles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return toCamelCase(data) as PatternProfile[];
}

export async function getPatternProfileByHandle(handle: string): Promise<PatternProfile | null> {
    const supabase = createClient();
    if (!supabase) {
        return FALLBACK_PROFILES.find((p) => p.shopifyHandle === handle) ?? null;
    }
    const { data, error } = await supabase
        .from('pattern_profiles')
        .select('*')
        .eq('shopify_handle', handle)
        .eq('is_active', true)
        .maybeSingle();
    if (error || !data) return null;
    return toCamelCase(data) as PatternProfile;
}

/** Join profiles with live Shopify pricing (or demo fixtures). */
export async function getPatternListings(region: Region): Promise<PatternListing[]> {
    const profiles = await getPatternProfiles();
    if (profiles.length === 0) return [];
    let products: CommerceProduct[] = [];
    if (isCommerceConfigured()) {
        try {
            products = (await getProductsByHandles(profiles.map((p) => p.shopifyHandle), region)) ?? [];
        } catch {
            products = [];
        }
    } else {
        products = demoProducts(region);
    }
    const byHandle = new Map(products.map((p) => [p.handle, p]));
    return profiles.map((profile) => ({
        profile,
        product: byHandle.get(profile.shopifyHandle) ?? null,
    }));
}

export async function getPatternListing(handle: string, region: Region): Promise<PatternListing | null> {
    const profile = await getPatternProfileByHandle(handle);
    if (!profile) return null;
    let product: CommerceProduct | null = null;
    if (isCommerceConfigured()) {
        try {
            const results = await getProductsByHandles([handle], region);
            product = results?.[0] ?? null;
        } catch {
            product = null;
        }
    } else {
        product = demoProducts(region).find((p) => p.handle === handle) ?? null;
    }
    return { profile, product };
}
