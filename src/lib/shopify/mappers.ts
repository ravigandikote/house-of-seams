// Shopify response shapes → our domain types. These interfaces describe
// exactly what the queries select, and nothing Shopify-shaped escapes
// this file.

import { CommerceCart, CommerceCartLine, CommercePrice, CommerceProduct } from '@/types/commerce';

interface ShopifyMoney {
    amount: string;
    currencyCode: string;
}

export interface ShopifyProduct {
    id: string;
    handle: string;
    title: string;
    description: string;
    availableForSale: boolean;
    featuredImage: { url: string } | null;
    priceRange: { minVariantPrice: ShopifyMoney };
    variants: { nodes: { id: string }[] };
}

export interface ShopifyCart {
    id: string;
    checkoutUrl: string;
    cost: { subtotalAmount: ShopifyMoney };
    lines: {
        nodes: {
            id: string;
            quantity: number;
            merchandise: {
                id: string;
                price: ShopifyMoney;
                product: {
                    title: string;
                    handle: string;
                    featuredImage: { url: string } | null;
                };
            };
        }[];
    };
}

function mapPrice(money: ShopifyMoney): CommercePrice {
    return { amount: money.amount, currencyCode: money.currencyCode };
}

export function mapProduct(p: ShopifyProduct): CommerceProduct | null {
    const variantId = p.variants.nodes[0]?.id;
    if (!variantId) return null;
    return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        description: p.description,
        price: mapPrice(p.priceRange.minVariantPrice),
        imageUrl: p.featuredImage?.url ?? null,
        availableForSale: p.availableForSale,
        variantId,
    };
}

export function mapCart(c: ShopifyCart): CommerceCart {
    const lines: CommerceCartLine[] = c.lines.nodes.map((line) => ({
        id: line.id,
        variantId: line.merchandise.id,
        quantity: line.quantity,
        title: line.merchandise.product.title,
        handle: line.merchandise.product.handle,
        imageUrl: line.merchandise.product.featuredImage?.url ?? null,
        price: mapPrice(line.merchandise.price),
    }));
    return {
        id: c.id,
        checkoutUrl: c.checkoutUrl,
        lines,
        subtotal: mapPrice(c.cost.subtotalAmount),
    };
}
