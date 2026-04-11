"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toCamelCase } from '@/lib/caseTransform';
import type { Order } from '@/types/account';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!orderId) return;
        const supabase = createClient();
        supabase.from('orders').select('*').eq('id', orderId).single().then(({ data }) => {
            if (data) setOrder(toCamelCase(data) as Order);
        });
    }, [orderId]);

    return (
        <div className="max-w-lg mx-auto text-center py-16 px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">Order Confirmed!</h1>
            <p className="text-warm-gray mb-6">Thank you for your purchase.</p>
            {order && (
                <div className="bg-white rounded-lg border p-4 mb-6 text-left">
                    <p className="text-sm"><span className="text-warm-gray">Order Number:</span> <strong>{order.orderNumber}</strong></p>
                    <p className="text-sm"><span className="text-warm-gray">Total:</span> <strong>&#8377;{order.totalAmount?.toLocaleString('en-IN')}</strong></p>
                    <p className="text-sm"><span className="text-warm-gray">Status:</span> <strong className="capitalize">{order.paymentStatus}</strong></p>
                </div>
            )}
            <div className="flex gap-3 justify-center">
                <Link href="/account/orders" className="text-dusty-rose hover:underline font-medium">View My Orders</Link>
                <Link href="/products" className="text-dusty-rose hover:underline font-medium">Continue Shopping</Link>
            </div>
        </div>
    );
}
