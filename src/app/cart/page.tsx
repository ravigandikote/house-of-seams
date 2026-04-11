"use client";

import React from 'react';
import { useCart } from '../../hooks/useCart';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const CartPage = () => {
    const { cartItems } = useCart();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <div className="mb-4">
                        {cartItems.map(item => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>
                    <CartSummary />
                </div>
            )}
        </div>
    );
};

export default CartPage;