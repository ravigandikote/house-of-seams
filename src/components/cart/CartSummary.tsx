"use client";

import React from 'react';
import { useCartStore } from '@/store/cartStore';

const CartSummary: React.FC = () => {
    const cartItems = useCartStore((s) => s.cartItems);
    const getTotalPrice = useCartStore((s) => s.getTotalPrice);
    const totalPrice = getTotalPrice();

    return (
        <div className="p-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold">Cart Summary</h2>
            <ul className="mt-2">
                {cartItems.map(item => (
                    <li key={item.id} className="flex justify-between py-2">
                        <span>{item.name} x {item.quantity}</span>
                        <span>&#8377;{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </li>
                ))}
            </ul>
            <div className="flex justify-between font-bold mt-4">
                <span>Total:</span>
                <span>&#8377;{totalPrice.toLocaleString('en-IN')}</span>
            </div>
        </div>
    );
};

export default CartSummary;
