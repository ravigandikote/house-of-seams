"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toCamelCase } from '@/lib/caseTransform';
import type { Order, OrderItem } from '@/types/account';

export default function OrderDetailPage() {
    const { id } = useParams();
    const { user } = useAuthContext();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) return;
        const supabase = createClient();
        Promise.all([
            supabase.from('orders').select('*').eq('id', id).eq('user_id', user.id).single(),
            supabase.from('order_items').select('*').eq('order_id', id),
        ]).then(([orderRes, itemsRes]) => {
            if (orderRes.data) setOrder(toCamelCase(orderRes.data) as Order);
            if (itemsRes.data) setItems(toCamelCase(itemsRes.data) as OrderItem[]);
            setLoading(false);
        });
    }, [user, id]);

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;
    if (!order) return <div className="text-center py-12 text-warm-gray">Order not found.</div>;

    return (
        <div>
            <Link href="/account/orders" className="text-dusty-rose hover:underline text-sm mb-4 inline-block">&larr; Back to Orders</Link>
            <h2 className="font-heading text-xl font-semibold mb-2">Order {order.orderNumber}</h2>
            <p className="text-sm text-warm-gray mb-6">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-xs text-warm-gray uppercase mb-1">Status</p>
                    <p className="font-medium capitalize">{order.status}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-xs text-warm-gray uppercase mb-1">Payment</p>
                    <p className="font-medium capitalize">{order.paymentStatus}</p>
                </div>
            </div>

            <h3 className="font-medium mb-3">Items</h3>
            <div className="space-y-3 mb-6">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg border p-3">
                        {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-warm-gray">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">&#8377;{item.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>&#8377;{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    );
}
