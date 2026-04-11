"use client";

import { useEffect } from 'react';
import { useStore } from '../store/wishlistStore';

const useWishlist = () => {
    const { wishlist, addToWishlist, removeFromWishlist } = useStore();

    useEffect(() => {
        // Load wishlist from local storage or API if needed
        const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        storedWishlist.forEach(item => addToWishlist(item));
    }, [addToWishlist]);

    const saveWishlistToLocalStorage = () => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    };

    useEffect(() => {
        saveWishlistToLocalStorage();
    }, [wishlist]);

    return {
        wishlist,
        addToWishlist,
        removeFromWishlist,
    };
};

export { useWishlist };
export default useWishlist;