'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { renderGarment } from '../customizer/rendererRegistry';
import { CornerFlourish } from '../ui/decor';
import { categoryById } from '@/types/customizerCategories';
import { formatPrice } from '@/types/commerce';
import { DIFFICULTY_LABELS, PATTERN_DIFFICULTIES, PatternListing } from '@/types/pattern';

// The pattern catalogue grid: filter by category + difficulty, cards
// with the SVG-rendered sketch in the paper frame. A listing without a
// Shopify product shows "coming soon" — browsable, not buyable.

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const DIFFICULTY_CHIP: Record<string, string> = {
    beginner: 'bg-sage-green-light text-charcoal',
    intermediate: 'bg-blush text-deep-rose-dark',
    advanced: 'bg-ink text-cream',
};

interface PatternIndexProps {
    listings: PatternListing[];
    initialCategory?: string;
}

const PatternIndex: React.FC<PatternIndexProps> = ({ listings, initialCategory }) => {
    const categories = Array.from(new Set(listings.map((l) => l.profile.category)));
    const [category, setCategory] = useState<string>(
        initialCategory && categories.includes(initialCategory as never) ? initialCategory : 'all'
    );
    const [difficulty, setDifficulty] = useState<string>('all');

    const filtered = listings.filter(
        (l) =>
            (category === 'all' || l.profile.category === category) &&
            (difficulty === 'all' || l.profile.difficulty === difficulty)
    );

    const pill = (active: boolean) =>
        `label-caps text-[10px] inline-flex min-h-[44px] items-center px-4 py-2 rounded-full border transition-colors duration-300 touch-manipulation ${
            active
                ? 'bg-deep-rose border-deep-rose text-white'
                : 'bg-ivory border-champagne-gold/40 text-charcoal hover:border-deep-rose hover:text-deep-rose'
        }`;

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
                <button type="button" className={pill(category === 'all')} onClick={() => setCategory('all')}>
                    All Garments
                </button>
                {categories.map((c) => (
                    <button key={c} type="button" className={pill(category === c)} onClick={() => setCategory(c)}>
                        {labelize(c)}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                <button type="button" className={pill(difficulty === 'all')} onClick={() => setDifficulty('all')}>
                    Every Level
                </button>
                {PATTERN_DIFFICULTIES.map((d) => (
                    <button key={d} type="button" className={pill(difficulty === d)} onClick={() => setDifficulty(d)}>
                        {DIFFICULTY_LABELS[d]}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-center font-accent italic text-lede text-warm-gray py-16">
                    Nothing on this shelf yet — try another filter.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(({ profile, product }) => {
                    const spec = categoryById(profile.previewConfig.renderer)?.spec;
                    return (
                        <Link
                            key={profile.id}
                            href={`/patterns/${profile.shopifyHandle}`}
                            className="group text-left bg-white rounded-sm overflow-hidden border border-champagne-gold/25 shadow-soft transition-all duration-300 touch-manipulation active:border-champagne-gold active:shadow-lift [@media(hover:hover)]:hover:shadow-lift [@media(hover:hover)]:hover:-translate-y-1"
                        >
                            <div className="relative paper-card p-5">
                                <CornerFlourish position="tl" />
                                {spec &&
                                    renderGarment(profile.previewConfig.renderer, {
                                        style: profile.previewConfig.style,
                                        measurements: spec.typicalDefaults,
                                        className: 'max-w-[190px] mx-auto',
                                    })}
                                <span
                                    className={`absolute top-3 right-3 label-caps text-[9px] rounded-full px-2.5 py-1 ${DIFFICULTY_CHIP[profile.difficulty]}`}
                                >
                                    {labelize(profile.difficulty)}
                                </span>
                            </div>
                            <div className="p-5 border-t border-champagne-gold/25">
                                <h3 className="font-heading text-title text-ink group-hover:text-deep-rose transition-colors duration-300">
                                    {profile.title}
                                </h3>
                                <p className="font-accent italic text-body-sm text-warm-gray mt-1">
                                    {labelize(profile.category)} · {profile.sizeRange}
                                </p>
                                <p className="mt-3">
                                    {product ? (
                                        <span className="text-body text-champagne-gold-dark font-medium">
                                            {formatPrice(product.price)}
                                            {product.id.startsWith('demo-') && (
                                                <span className="label-caps text-[9px] text-warm-gray ml-2">sample</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="label-caps text-[10px] text-warm-gray">Coming soon</span>
                                    )}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default PatternIndex;
