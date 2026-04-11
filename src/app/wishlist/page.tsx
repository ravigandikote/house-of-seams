"use client";

import React from 'react';
import { useWishlist } from '../../hooks/useWishlist';
import ProductCard from '../../components/products/ProductCard';

const WishlistPage = () => {
    const { wishlist } = useWishlist();

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="font-heading text-3xl font-bold mb-6 text-charcoal">Your Wishlist</h1>
            {wishlist.length === 0 ? (
                <p className="text-warm-gray">Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;