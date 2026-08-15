'use client';

import React from 'react';
import { usePatternCartStore } from '@/store/patternCartStore';
import { useRegion } from '@/lib/region';
import { REGIONS, REGION_META } from '@/types/commerce';

// India/US currency toggle — footer + cart drawer. Switching updates the
// cookie and re-prices the pattern bag through Shopify Markets.

const RegionSelector: React.FC<{ tone?: 'light' | 'dark'; className?: string }> = ({
    tone = 'light',
    className = '',
}) => {
    const [region, setRegion] = useRegion();
    const applyRegion = usePatternCartStore((s) => s.applyRegion);

    const base =
        tone === 'dark'
            ? { active: 'bg-champagne-gold/20 text-champagne-gold-light border-champagne-gold/50', idle: 'text-cream/60 border-transparent hover:text-cream' }
            : { active: 'bg-ivory text-champagne-gold-dark border-champagne-gold/50', idle: 'text-warm-gray border-transparent hover:text-charcoal' };

    return (
        <div className={`inline-flex items-center gap-1 ${className}`} role="group" aria-label="Currency region">
            {REGIONS.map((r) => (
                <button
                    key={r}
                    type="button"
                    onClick={() => {
                        setRegion(r);
                        applyRegion(r);
                    }}
                    className={`label-caps text-[10px] inline-flex min-h-[44px] items-center px-3 py-1.5 rounded-full border transition-colors duration-300 touch-manipulation ${
                        region === r ? base.active : base.idle
                    }`}
                    aria-pressed={region === r}
                >
                    {REGION_META[r].label} · {REGION_META[r].symbol}
                </button>
            ))}
        </div>
    );
};

export default RegionSelector;
