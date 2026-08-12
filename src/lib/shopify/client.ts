// Storefront API GraphQL client — the ONLY place that talks to Shopify.
// API version is pinned; bumping it is a one-line change reviewed against
// the queries in this folder. Mirrors the Supabase demo-mode pattern:
// when the env vars are absent/placeholders, isCommerceConfigured() is
// false and every module function resolves to null — surfaces render
// their graceful "commerce demo mode" fallbacks.

const API_VERSION = '2024-07';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

const configured = !!domain && !!token && !domain.includes('placeholder') && !token.includes('placeholder');

export function isCommerceConfigured(): boolean {
    return configured;
}

export class ShopifyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ShopifyError';
    }
}

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

/** Low-level fetch. Returns null when unconfigured; throws ShopifyError
 *  on transport/GraphQL errors (callers decide the UI consequence). */
export async function storefrontFetch<T>(
    query: string,
    variables: Record<string, unknown>
): Promise<T | null> {
    if (!configured) return null;
    const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token!,
        },
        body: JSON.stringify({ query, variables }),
        // Prices/availability must be live — never serve a stale cart.
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new ShopifyError(`Shopify responded ${res.status}`);
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
        throw new ShopifyError(json.errors.map((e) => e.message).join('; '));
    }
    return json.data ?? null;
}
