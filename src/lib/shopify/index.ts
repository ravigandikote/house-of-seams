// THE commerce module. Components import from here and nowhere else —
// no Shopify SDK, fetch, or GraphQL beyond this folder. All functions
// return null when commerce is unconfigured (demo mode); callers render
// their graceful fallbacks (usually via the demo fixtures).

import { isCommerceConfigured, storefrontFetch } from './client';
import { ShopifyCart, ShopifyProduct, mapCart, mapProduct } from './mappers';
import {
    CART_BUYER_IDENTITY_MUTATION,
    CART_CREATE_MUTATION,
    CART_FETCH_QUERY,
    CART_LINES_ADD_MUTATION,
    CART_LINES_REMOVE_MUTATION,
    CART_LINES_UPDATE_MUTATION,
    PRODUCT_BY_HANDLE_QUERY,
    PRODUCTS_BY_COLLECTION_QUERY,
    PRODUCTS_BY_HANDLES_QUERY,
} from './queries';
import { CommerceCart, CommerceProduct, Region } from '@/types/commerce';

export { isCommerceConfigured } from './client';
export { demoProducts, demoProductByHandle } from './demoFixtures';

export async function getProductsByCollection(
    collectionHandle: string,
    region: Region
): Promise<CommerceProduct[] | null> {
    const data = await storefrontFetch<{ collection: { products: { nodes: ShopifyProduct[] } } | null }>(
        PRODUCTS_BY_COLLECTION_QUERY,
        { handle: collectionHandle, country: region }
    );
    if (!data) return null;
    return (data.collection?.products.nodes ?? [])
        .map(mapProduct)
        .filter((p): p is CommerceProduct => p !== null);
}

/** Batch-fetch by handles (drives the pattern-profile join in S2). */
export async function getProductsByHandles(
    handles: string[],
    region: Region
): Promise<CommerceProduct[] | null> {
    if (handles.length === 0) return [];
    const query = handles.map((h) => `handle:${h}`).join(' OR ');
    const data = await storefrontFetch<{ products: { nodes: ShopifyProduct[] } }>(
        PRODUCTS_BY_HANDLES_QUERY,
        { query, country: region }
    );
    if (!data) return null;
    return data.products.nodes.map(mapProduct).filter((p): p is CommerceProduct => p !== null);
}

export async function getProductByHandle(
    handle: string,
    region: Region
): Promise<CommerceProduct | null> {
    const data = await storefrontFetch<{ product: ShopifyProduct | null }>(PRODUCT_BY_HANDLE_QUERY, {
        handle,
        country: region,
    });
    if (!data?.product) return null;
    return mapProduct(data.product);
}

interface CartMutationPayload {
    cart: ShopifyCart | null;
    userErrors: { message: string }[];
}

function unwrapCart(payload: CartMutationPayload | undefined | null): CommerceCart | null {
    if (!payload) return null;
    if (payload.userErrors?.length) {
        throw new Error(payload.userErrors.map((e) => e.message).join('; '));
    }
    return payload.cart ? mapCart(payload.cart) : null;
}

export async function createCart(
    lines: { variantId: string; quantity: number }[],
    region: Region
): Promise<CommerceCart | null> {
    const data = await storefrontFetch<{ cartCreate: CartMutationPayload }>(CART_CREATE_MUTATION, {
        lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
        country: region,
    });
    return unwrapCart(data?.cartCreate);
}

export async function addCartLines(
    cartId: string,
    lines: { variantId: string; quantity: number }[],
    region: Region
): Promise<CommerceCart | null> {
    const data = await storefrontFetch<{ cartLinesAdd: CartMutationPayload }>(CART_LINES_ADD_MUTATION, {
        cartId,
        lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
        country: region,
    });
    return unwrapCart(data?.cartLinesAdd);
}

export async function updateCartLine(
    cartId: string,
    lineId: string,
    quantity: number,
    region: Region
): Promise<CommerceCart | null> {
    const data = await storefrontFetch<{ cartLinesUpdate: CartMutationPayload }>(
        CART_LINES_UPDATE_MUTATION,
        { cartId, lines: [{ id: lineId, quantity }], country: region }
    );
    return unwrapCart(data?.cartLinesUpdate);
}

export async function removeCartLine(
    cartId: string,
    lineId: string,
    region: Region
): Promise<CommerceCart | null> {
    const data = await storefrontFetch<{ cartLinesRemove: CartMutationPayload }>(
        CART_LINES_REMOVE_MUTATION,
        { cartId, lineIds: [lineId], country: region }
    );
    return unwrapCart(data?.cartLinesRemove);
}

export async function fetchCart(cartId: string, region: Region): Promise<CommerceCart | null> {
    const data = await storefrontFetch<{ cart: ShopifyCart | null }>(CART_FETCH_QUERY, {
        cartId,
        country: region,
    });
    if (!data?.cart) return null;
    return mapCart(data.cart);
}

/** Re-point an existing cart at a new region so Markets reprices it. */
export async function updateCartRegion(cartId: string, region: Region): Promise<CommerceCart | null> {
    const data = await storefrontFetch<{ cartBuyerIdentityUpdate: CartMutationPayload }>(
        CART_BUYER_IDENTITY_MUTATION,
        { cartId, country: region }
    );
    return unwrapCart(data?.cartBuyerIdentityUpdate);
}
