'use client';

import React from 'react';
import Link from 'next/link';
import { useRegion } from '@/lib/region';
import { usePatternCartStore } from '@/store/patternCartStore';
import { formatPrice } from '@/types/commerce';
import { PatternListing } from '@/types/pattern';

// "The pattern behind this design" — a quiet cross-sell on the customizer
// preview step. Deliberately understated: the bespoke "Request My Design"
// journey stays primary; this whispers rather than competes.

const RelatedPatternCard: React.FC<{ listing: PatternListing; className?: string }> = ({
    listing,
    className = '',
}) => {
    const [region] = useRegion();
    const addProduct = usePatternCartStore((s) => s.addProduct);
    const { profile, product } = listing;
    if (!product) return null;

    return (
        <div className={`border border-champagne-gold/30 bg-ivory/60 rounded-sm px-4 py-3 ${className}`}>
            <p className="label-caps text-[9px] text-champagne-gold-dark mb-1">
                The pattern behind this design
            </p>
            <div className="flex items-center justify-between gap-3">
                <Link href={`/patterns/${profile.shopifyHandle}`} className="min-w-0 group">
                    <span className="text-body-sm text-ink group-hover:text-deep-rose transition-colors block truncate">
                        {profile.title} — {formatPrice(product.price)}
                    </span>
                    <span className="text-caption text-warm-gray">Sew it yourself · instant PDF</span>
                </Link>
                <button
                    type="button"
                    onClick={() => addProduct(product, region)}
                    className="label-caps text-[9px] shrink-0 px-3 py-1.5 rounded-full border border-champagne-gold/50 text-champagne-gold-dark hover:border-deep-rose hover:text-deep-rose transition-colors duration-300"
                >
                    Add to bag
                </button>
            </div>
        </div>
    );
};

export default RelatedPatternCard;
