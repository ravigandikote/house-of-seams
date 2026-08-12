import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    addCartLines,
    createCart,
    demoProductByHandle,
    fetchCart,
    isCommerceConfigured,
    removeCartLine,
    updateCartLine,
    updateCartRegion,
} from '@/lib/shopify';
import { CommerceCart, CommerceCartLine, CommerceProduct, Region } from '@/types/commerce';

// SIBLING of the existing cartStore, deliberately not an extension of it:
// the old store holds local Supabase products for the Razorpay/enquiry
// flow, while this one mirrors a REMOTE Shopify cart (server-issued cart
// id, server-priced lines, reconciliation after every mutation). The two
// commerce models share nothing but the word "cart", and the pattern
// shop's hard boundary (Shopify never touches the bespoke pipeline) is
// easier to hold with the stores physically apart.
//
// Optimistic updates: line quantities update locally first, then the
// Shopify response replaces the whole cart (reconciliation); any thrown
// error refetches the server truth.
//
// Commerce demo mode: no Shopify calls at all — lines are kept purely
// locally against the demo fixtures so the drawer is fully reviewable;
// checkoutUrl stays null and the checkout button explains itself.

interface PatternCartStore {
    cartId: string | null;
    checkoutUrl: string | null;
    lines: CommerceCartLine[];
    subtotalAmount: string | null;
    currencyCode: string | null;
    isOpen: boolean;
    isBusy: boolean;
    error: string | null;
    openDrawer: () => void;
    closeDrawer: () => void;
    addProduct: (product: CommerceProduct, region: Region) => Promise<void>;
    setQuantity: (lineId: string, quantity: number, region: Region) => Promise<void>;
    removeLine: (lineId: string, region: Region) => Promise<void>;
    /** Re-price everything after a region switch. */
    applyRegion: (region: Region) => Promise<void>;
    refresh: (region: Region) => Promise<void>;
    clear: () => void;
}

function applyCart(set: (partial: Partial<PatternCartStore>) => void, cart: CommerceCart | null) {
    if (!cart) return;
    set({
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
        lines: cart.lines,
        subtotalAmount: cart.subtotal.amount,
        currencyCode: cart.subtotal.currencyCode,
        error: null,
    });
}

function demoSubtotal(lines: CommerceCartLine[]): { amount: string; currency: string | null } {
    const total = lines.reduce((sum, l) => sum + Number(l.price.amount) * l.quantity, 0);
    return { amount: String(total), currency: lines[0]?.price.currencyCode ?? null };
}

export const usePatternCartStore = create<PatternCartStore>()(
    persist(
        (set, get) => ({
            cartId: null,
            checkoutUrl: null,
            lines: [],
            subtotalAmount: null,
            currencyCode: null,
            isOpen: false,
            isBusy: false,
            error: null,

            openDrawer: () => set({ isOpen: true }),
            closeDrawer: () => set({ isOpen: false }),

            addProduct: async (product, region) => {
                if (!isCommerceConfigured()) {
                    // Demo mode: local-only lines against the fixtures.
                    const existing = get().lines.find((l) => l.variantId === product.variantId);
                    const lines = existing
                        ? get().lines.map((l) =>
                              l.variantId === product.variantId ? { ...l, quantity: l.quantity + 1 } : l
                          )
                        : [
                              ...get().lines,
                              {
                                  id: `demo-line-${product.variantId}`,
                                  variantId: product.variantId,
                                  quantity: 1,
                                  title: product.title,
                                  handle: product.handle,
                                  imageUrl: product.imageUrl,
                                  price: product.price,
                              },
                          ];
                    const { amount, currency } = demoSubtotal(lines);
                    set({ lines, subtotalAmount: amount, currencyCode: currency, isOpen: true });
                    return;
                }
                set({ isBusy: true, error: null, isOpen: true });
                try {
                    const { cartId } = get();
                    const cart = cartId
                        ? await addCartLines(cartId, [{ variantId: product.variantId, quantity: 1 }], region)
                        : await createCart([{ variantId: product.variantId, quantity: 1 }], region);
                    applyCart(set, cart);
                } catch (err) {
                    set({ error: err instanceof Error ? err.message : 'Could not update the bag' });
                } finally {
                    set({ isBusy: false });
                }
            },

            setQuantity: async (lineId, quantity, region) => {
                const previous = get().lines;
                // Optimistic
                const optimistic = previous
                    .map((l) => (l.id === lineId ? { ...l, quantity } : l))
                    .filter((l) => l.quantity > 0);
                set({ lines: optimistic });
                if (!isCommerceConfigured()) {
                    const { amount, currency } = demoSubtotal(optimistic);
                    set({ subtotalAmount: amount, currencyCode: currency });
                    return;
                }
                const { cartId } = get();
                if (!cartId) return;
                set({ isBusy: true });
                try {
                    const cart =
                        quantity <= 0
                            ? await removeCartLine(cartId, lineId, region)
                            : await updateCartLine(cartId, lineId, quantity, region);
                    applyCart(set, cart);
                } catch (err) {
                    // Reconcile with server truth on failure.
                    set({ lines: previous, error: err instanceof Error ? err.message : 'Could not update the bag' });
                    await get().refresh(region);
                } finally {
                    set({ isBusy: false });
                }
            },

            removeLine: async (lineId, region) => {
                await get().setQuantity(lineId, 0, region);
            },

            applyRegion: async (region) => {
                if (!isCommerceConfigured()) {
                    // Demo lines re-price via fixtures for the new region.
                    const lines = get().lines.flatMap((l) => {
                        const product = demoProductByHandle(l.handle, region);
                        return product ? [{ ...l, price: product.price }] : [l];
                    });
                    const { amount, currency } = demoSubtotal(lines);
                    set({ lines, subtotalAmount: amount, currencyCode: currency });
                    return;
                }
                const { cartId } = get();
                if (!cartId) return;
                set({ isBusy: true });
                try {
                    applyCart(set, await updateCartRegion(cartId, region));
                } catch {
                    await get().refresh(region);
                } finally {
                    set({ isBusy: false });
                }
            },

            refresh: async (region) => {
                if (!isCommerceConfigured()) return;
                const { cartId } = get();
                if (!cartId) return;
                try {
                    const cart = await fetchCart(cartId, region);
                    if (cart) {
                        applyCart(set, cart);
                    } else {
                        // Cart expired/completed on Shopify's side.
                        set({ cartId: null, checkoutUrl: null, lines: [], subtotalAmount: null });
                    }
                } catch {
                    // Keep local state; next mutation reconciles.
                }
            },

            clear: () =>
                set({ cartId: null, checkoutUrl: null, lines: [], subtotalAmount: null, currencyCode: null }),
        }),
        {
            name: 'hos-pattern-cart',
            partialize: (state) => ({
                cartId: state.cartId,
                checkoutUrl: state.checkoutUrl,
                lines: state.lines,
                subtotalAmount: state.subtotalAmount,
                currencyCode: state.currencyCode,
            }),
        }
    )
);
