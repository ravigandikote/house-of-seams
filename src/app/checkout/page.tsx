"use client";

import React from 'react';
import CheckoutForm from '../../components/cart/CheckoutForm';
import CartSummary from '../../components/cart/CartSummary';

const CheckoutPage = () => {
    return (
        <div className="checkout-page">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/3 mb-4 md:mb-0">
                    <CheckoutForm />
                </div>
                <div className="w-full md:w-1/3">
                    <CartSummary />
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;