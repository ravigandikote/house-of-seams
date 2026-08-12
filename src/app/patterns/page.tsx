import React from 'react';
import { Metadata } from 'next';
import PatternIndex from '@/components/commerce/PatternIndex';
import { GoldDivider } from '@/components/ui/decor';
import { getPatternListings } from '@/lib/patterns';
import { serverRegion } from '@/lib/regionServer';

// The Pattern Shop index — digital sewing patterns for home sewists and
// professional designers, priced per region through Shopify Markets.

export const metadata: Metadata = {
    title: 'Sewing Patterns | House of Seams',
    description:
        'Digital sewing patterns from a working couture atelier — blouses, lehengas, kurtis, and bottoms in A4, A0, and projector formats, sized for real bodies.',
};

const PatternsPage = async ({ searchParams }: { searchParams?: { category?: string } }) => {
    const region = serverRegion();
    const listings = await getPatternListings(region);

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Pattern Shop</p>
            <h1 className="font-heading text-display-lg text-center text-ink mb-3">
                Patterns from the Atelier
            </h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-2xl mx-auto">
                The same cuts we stitch for our clients, drafted as digital patterns — whether
                you sew for the joy of it or draft for clients of your own.
            </p>
            <p className="text-center text-body-sm text-warm-gray mb-8 max-w-xl mx-auto">
                Every pattern is an instant PDF download with layered sizes and illustrated
                instructions. Prefer it stitched instead?{' '}
                <a href="/customize" className="link-gold">Design it with Kavya</a> and the
                atelier will make it for you.
            </p>
            <GoldDivider className="mb-10" />
            <PatternIndex listings={listings} initialCategory={searchParams?.category} />
        </div>
    );
};

export default PatternsPage;
