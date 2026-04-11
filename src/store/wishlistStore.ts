import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    imageUrl?: string;
}

interface WishlistStore {
    wishlist: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            wishlist: [],
            addToWishlist: (item) =>
                set((state) => {
                    if (state.wishlist.find((i) => i.id === item.id)) return state;
                    return { wishlist: [...state.wishlist, item] };
                }),
            removeFromWishlist: (id) =>
                set((state) => ({
                    wishlist: state.wishlist.filter((i) => i.id !== id),
                })),
            isInWishlist: (id) => get().wishlist.some((i) => i.id === id),
        }),
        {
            name: 'hos-wishlist',
        }
    )
);

// Backward compat alias
export const useStore = useWishlistStore;
