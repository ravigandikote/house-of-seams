import React from 'react';

// Reusable couture ornament. Sparse by design: ornament frames content,
// it never competes with it. All SVGs are inline and tiny.

/** Thin gold hairline with a lotus-dot centre motif. */
export const GoldDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
        <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-champagne-gold/70" />
        <svg width="26" height="12" viewBox="0 0 26 12" className="text-champagne-gold shrink-0">
            <path
                d="M13 1 C15.5 4 19 5.5 22 6 C19 6.5 15.5 8 13 11 C10.5 8 7 6.5 4 6 C7 5.5 10.5 4 13 1 Z"
                fill="currentColor"
                opacity="0.9"
            />
            <circle cx="1.5" cy="6" r="1.2" fill="currentColor" opacity="0.6" />
            <circle cx="24.5" cy="6" r="1.2" fill="currentColor" opacity="0.6" />
        </svg>
        <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-champagne-gold/70" />
    </div>
);

/** Embroidery-inspired corner flourish for cards (absolute-positioned). */
export const CornerFlourish: React.FC<{ position?: 'tl' | 'tr' | 'bl' | 'br'; className?: string }> = ({
    position = 'tl',
    className = '',
}) => {
    const pos = {
        tl: 'top-2 left-2',
        tr: 'top-2 right-2 rotate-90',
        bl: 'bottom-2 left-2 -rotate-90',
        br: 'bottom-2 right-2 rotate-180',
    }[position];
    return (
        <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            aria-hidden="true"
            className={`absolute ${pos} text-champagne-gold/60 pointer-events-none ${className}`}
        >
            <path d="M1 15 C1 7 7 1 15 1" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M4 15 C4 9 9 4 15 4" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.7" />
            <circle cx="1" cy="15" r="1.3" fill="currentColor" />
            <circle cx="15" cy="1" r="1.3" fill="currentColor" />
        </svg>
    );
};

interface SectionHeaderProps {
    kicker?: string;
    title: string;
    subline?: string;
    align?: 'center' | 'left';
    className?: string;
}

/** Small-caps gold kicker + Playfair headline + Cormorant subline. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
    kicker,
    title,
    subline,
    align = 'center',
    className = '',
}) => {
    const alignCls = align === 'center' ? 'text-center items-center' : 'text-left items-start';
    return (
        <div className={`flex flex-col ${alignCls} ${className}`}>
            {kicker && (
                <p className="label-caps text-champagne-gold-dark mb-3">{kicker}</p>
            )}
            <h2 className="font-heading text-display text-ink">{title}</h2>
            {subline && (
                <p className={`font-accent text-lede italic text-warm-gray mt-3 max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}>
                    {subline}
                </p>
            )}
        </div>
    );
};
