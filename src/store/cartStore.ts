import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartStore {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cartItems: [],
            addToCart: (item) =>
                set((state) => {
                    const existing = state.cartItems.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            cartItems: state.cartItems.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return { cartItems: [...state.cartItems, { ...item, quantity: 1 }] };
                }),
            removeFromCart: (id) =>
                set((state) => ({
                    cartItems: state.cartItems.filter((i) => i.id !== id),
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    cartItems: quantity <= 0
                        ? state.cartItems.filter((i) => i.id !== id)
                        : state.cartItems.map((i) =>
                            i.id === id ? { ...i, quantity } : i
                        ),
                })),
            clearCart: () => set({ cartItems: [] }),
            getTotalItems: () => get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
            getTotalPrice: () => get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
        {
            name: 'hos-cart',
        }
    )
);

// Backward compat alias
export const useStore = useCartStore;
