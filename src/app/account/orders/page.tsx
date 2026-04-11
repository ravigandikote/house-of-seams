"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toCamelCase } from '@/lib/caseTransform';
import type { Order } from '@/types/account';

export default function OrdersPage() {
    const { user } = useAuthContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const supabase = createClient();
        supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setOrders((toCamelCase(data || []) as Order[]));
                setLoading(false);
            });
    }, [user]);

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;

    const statusColor: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        processing: 'bg-indigo-100 text-indigo-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <div>
            <h2 className="font-heading text-xl font-semibold mb-6">My Orders</h2>
            {orders.length === 0 ? (
                <div className="text-center py-12 text-warm-gray">
                    <p className="mb-4">You haven&apos;t placed any orders yet.</p>
                    <Link href="/products" className="text-dusty-rose hover:underline">Browse Products</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link key={order.id} href={`/account/orders/${order.id}`}
                            className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-dusty-rose transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{order.orderNumber}</p>
                                    <p className="text-sm text-warm-gray">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">&#8377;{order.totalAmount.toLocaleString('en-IN')}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
