// Domain types for the commerce rail (Shopify-backed patterns, later
// selected physical products). Shopify's own shapes NEVER leave
// src/lib/shopify/ — every surface consumes these camelCase types, so a
// Storefront API version bump touches exactly one module.

export const REGIONS = ['IN', 'US'] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_META: Record<Region, { label: string; currency: string; symbol: string }> = {
    IN: { label: 'India', currency: 'INR', symbol: '₹' },
    US: { label: 'United States', currency: 'USD', symbol: '$' },
};

export interface CommercePrice {
    /** Decimal string as Shopify returns it, e.g. "499.0". */
    amount: string;
    currencyCode: string;
}

export interface CommerceProduct {
    id: string;
    handle: string;
    title: string;
    description: string;
    price: CommercePrice;
    /** First product image, if any (patterns usually use our SVG render). */
    imageUrl: string | null;
    availableForSale: boolean;
    /** The default variant id — what cart lines reference. */
    variantId: string;
}

export interface CommerceCartLine {
    id: string;
    variantId: string;
    quantity: number;
    title: string;
    handle: string;
    imageUrl: string | null;
    price: CommercePrice;
}

export interface CommerceCart {
    id: string;
    checkoutUrl: string;
    lines: CommerceCartLine[];
    subtotal: CommercePrice;
}

/** ₹499 / $12.00 — clean per-currency display. */
export function formatPrice(price: CommercePrice): string {
    const value = Number(price.amount);
    if (!Number.isFinite(value)) return '';
    if (price.currencyCode === 'INR') {
        const rounded = Math.round(value);
        return `₹${rounded.toLocaleString('en-IN')}`;
    }
    if (price.currencyCode === 'USD') {
        return `$${value.toFixed(2)}`;
    }
    return `${value.toFixed(2)} ${price.currencyCode}`;
}
