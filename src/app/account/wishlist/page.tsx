"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toCamelCase } from '@/lib/caseTransform';

interface WishlistProduct {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        imageUrl: string;
        category: string;
    } | null;
}

export default function WishlistPage() {
    const { user } = useAuthContext();
    const [items, setItems] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const fetchWishlist = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('wishlists')
            .select('id, product_id, products(id, name, price, image, image_url, category)')
            .eq('user_id', user.id);
        const items = (data || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            product: item.products ? toCamelCase(item.products) as any : null,
        }));
        setItems(items);
        setLoading(false);
    };

    useEffect(() => { fetchWishlist(); }, [user]);

    const removeFromWishlist = async (wishlistId: string) => {
        await supabase.from('wishlists').delete().eq('id', wishlistId);
        setItems((prev) => prev.filter((i) => i.id !== wishlistId));
    };

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;

    return (
        <div>
            <h2 className="font-heading text-xl font-semibold mb-6">My Wishlist</h2>
            {items.length === 0 ? (
                <div className="text-center py-12 text-warm-gray">
                    <p className="mb-4">Your wishlist is empty.</p>
                    <Link href="/products" className="text-dusty-rose hover:underline">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg border overflow-hidden flex">
                            {item.product?.imageUrl && (
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover" />
                            )}
                            <div className="flex-1 p-3 flex flex-col justify-between">
                                <div>
                                    <p className="font-medium text-sm">{item.product?.name || 'Product'}</p>
                                    <p className="text-dusty-rose font-semibold text-sm">&#8377;{item.product?.price?.toLocaleString('en-IN')}</p>
                                </div>
                                <button onClick={() => removeFromWishlist(item.id)} className="text-xs text-red-500 hover:underline self-start">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
