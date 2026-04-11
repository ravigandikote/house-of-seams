"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useRazorpay } from '@/hooks/useRazorpay';
import { createClient } from '@/lib/supabase/client';
import { toCamelCase } from '@/lib/caseTransform';
import { Button } from '@/components/ui/Button';
import type { Address } from '@/types/account';

const CheckoutForm = () => {
    const { cartItems, getTotalPrice, clearCart } = useCartStore();
    const { user } = useAuthContext();
    const { loaded, openPayment } = useRazorpay();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const totalPrice = getTotalPrice();

    useEffect(() => {
        if (!user) return;
        const supabase = createClient();
        supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .then(({ data }) => {
                const addrs = (toCamelCase(data || []) as Address[]);
                setAddresses(addrs);
                if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
            });
    }, [user]);

    const handlePayment = async () => {
        if (!user) {
            router.push('/login?next=/checkout');
            return;
        }
        if (cartItems.length === 0) return;
        if (!selectedAddressId && addresses.length > 0) {
            setError('Please select a shipping address.');
            return;
        }

        setProcessing(true);
        setError('');

        const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

        const res = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cartItems.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                })),
                shippingAddress: selectedAddress || null,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            setError(err.error || 'Failed to create order');
            setProcessing(false);
            return;
        }

        const { orderId, razorpayOrderId, amount, currency } = await res.json();

        openPayment({
            razorpayOrderId,
            amount,
            currency,
            orderId,
            name: user.user_metadata?.full_name,
            email: user.email,
            onSuccess: () => {
                clearCart();
                router.push(`/checkout/success?orderId=${orderId}`);
            },
            onFailure: (err) => {
                setError(err?.error || 'Payment failed. Please try again.');
                setProcessing(false);
            },
        });
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-warm-gray mb-4">Please sign in to checkout.</p>
                <Button onClick={() => router.push('/login?next=/checkout')}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl font-bold mb-6">Checkout</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-lg border p-4 mb-6">
                <h3 className="font-medium mb-3">Order Items</h3>
                {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                            {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                            <div>
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-warm-gray">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold text-sm">&#8377;{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                ))}
                <div className="flex justify-between font-bold mt-4 pt-2 border-t">
                    <span>Total</span>
                    <span>&#8377;{totalPrice.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* Address Selection */}
            {addresses.length > 0 && (
                <div className="bg-white rounded-lg border p-4 mb-6">
                    <h3 className="font-medium mb-3">Shipping Address</h3>
                    <div className="space-y-2">
                        {addresses.map((addr) => (
                            <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedAddressId === addr.id ? 'border-dusty-rose bg-dusty-rose/5' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="address"
                                    value={addr.id}
                                    checked={selectedAddressId === addr.id}
                                    onChange={() => setSelectedAddressId(addr.id)}
                                    className="mt-1"
                                />
                                <div className="text-sm">
                                    <p className="font-medium">{addr.fullName} <span className="text-warm-gray">({addr.label})</span></p>
                                    <p className="text-warm-gray">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <Button
                onClick={handlePayment}
                disabled={processing || !loaded || cartItems.length === 0}
                className="w-full"
            >
                {processing ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
            </Button>
        </div>
    );
};

export default CheckoutForm;
