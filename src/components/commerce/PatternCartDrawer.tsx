'use client';

import React, { useEffect } from 'react';
import RegionSelector from './RegionSelector';
import { GoldDivider } from '../ui/decor';
import { isCommerceConfigured } from '@/lib/shopify';
import { useRegion } from '@/lib/region';
import { usePatternCartStore } from '@/store/patternCartStore';
import { formatPrice } from '@/types/commerce';

// The pattern bag — a couture slide-over. Line items carry the sketch
// thumbnail (or a paper placeholder), quantities edit inline, and
// checkout hands over to Shopify's hosted checkout. In commerce demo
// mode the bag works locally and the checkout button explains itself.

const PatternCartDrawer: React.FC = () => {
    const [region] = useRegion();
    const {
        isOpen,
        closeDrawer,
        lines,
        subtotalAmount,
        currencyCode,
        checkoutUrl,
        isBusy,
        error,
        setQuantity,
        removeLine,
        refresh,
    } = usePatternCartStore();

    // Reconcile against Shopify whenever the drawer opens.
    useEffect(() => {
        if (isOpen) refresh(region);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Escape closes; body scroll locks while open.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, closeDrawer]);

    if (!isOpen) return null;

    const configured = isCommerceConfigured();
    const subtotal =
        subtotalAmount && currencyCode
            ? formatPrice({ amount: subtotalAmount, currencyCode })
            : null;

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Boutique bag">
            {/* Scrim */}
            <button
                type="button"
                aria-label="Close the bag"
                onClick={closeDrawer}
                className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] cursor-default"
            />
            {/* Panel */}
            <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-lift flex flex-col animate-slide-in-right">
                <header className="px-6 pt-6 pb-4 border-b border-champagne-gold/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="label-caps text-champagne-gold-dark mb-1">The Boutique Bag</p>
                            <h2 className="font-heading text-headline text-ink">Your bag</h2>
                        </div>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            aria-label="Close"
                            className="text-warm-gray hover:text-deep-rose text-xl leading-none px-2 py-1 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {lines.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="font-accent italic text-lede text-warm-gray">
                                The bag is empty — everything you add will wait for you here.
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-5">
                            {lines.map((line) => (
                                <li key={line.id} className="flex gap-4">
                                    <div className="w-16 h-20 shrink-0 paper-card border border-champagne-gold/30 rounded-sm overflow-hidden flex items-center justify-center">
                                        {line.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={line.imageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="1.2" aria-hidden="true">
                                                <path d="M7 3 L17 3 L20 8 L12 21 L4 8 Z" />
                                                <path d="M4 8 L20 8 M12 21 L7 3 M12 21 L17 3" opacity="0.5" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-heading text-body text-ink leading-snug">{line.title}</p>
                                        <p className="text-body-sm text-champagne-gold-dark mt-0.5">
                                            {formatPrice(line.price)}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="inline-flex items-center border border-champagne-gold/40 rounded-full">
                                                <button
                                                    type="button"
                                                    aria-label="Decrease quantity"
                                                    disabled={isBusy}
                                                    onClick={() => setQuantity(line.id, line.quantity - 1, region)}
                                                    className="px-2.5 py-0.5 text-warm-gray hover:text-deep-rose disabled:opacity-40"
                                                >
                                                    −
                                                </button>
                                                <span className="text-body-sm text-ink tabular-nums w-5 text-center">
                                                    {line.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Increase quantity"
                                                    disabled={isBusy}
                                                    onClick={() => setQuantity(line.id, line.quantity + 1, region)}
                                                    className="px-2.5 py-0.5 text-warm-gray hover:text-deep-rose disabled:opacity-40"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() => removeLine(line.id, region)}
                                                className="link-gold text-caption disabled:opacity-40"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {error && (
                        <p className="text-body-sm text-red-500 mt-4" role="alert">{error}</p>
                    )}
                </div>

                <footer className="px-6 pt-4 pb-6 border-t border-champagne-gold/30 bg-ivory/60">
                    {lines.length > 0 && (
                        <div className="flex items-baseline justify-between mb-4">
                            <span className="label-caps text-warm-gray">Subtotal</span>
                            <span className="font-heading text-headline text-ink">{subtotal ?? '—'}</span>
                        </div>
                    )}
                    {configured ? (
                        <a
                            href={checkoutUrl ?? undefined}
                            aria-disabled={!checkoutUrl || lines.length === 0}
                            className={`label-caps block text-center w-full rounded-sm px-6 py-3.5 transition-colors duration-300 ${
                                checkoutUrl && lines.length > 0
                                    ? 'bg-deep-rose text-white hover:bg-deep-rose-dark'
                                    : 'bg-ivory text-warm-gray/60 border border-champagne-gold/30 pointer-events-none'
                            }`}
                        >
                            Continue to Secure Checkout
                        </a>
                    ) : (
                        <div className="text-center">
                            <span className="label-caps block w-full rounded-sm px-6 py-3.5 bg-ivory text-warm-gray/70 border border-champagne-gold/30">
                                Checkout opens with the boutique&apos;s store
                            </span>
                            <p className="text-caption text-warm-gray mt-2">
                                Preview mode — patterns and prices shown are samples.
                            </p>
                        </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-caption text-warm-gray">Patterns download instantly after payment</p>
                        <RegionSelector />
                    </div>
                    <GoldDivider className="mt-4" />
                </footer>
            </aside>
        </div>
    );
};

export default PatternCartDrawer;
