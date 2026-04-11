"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../store/cartStore';
import { CartItemType } from '../types/cart';

const useCart = () => {
    const { cartItems, addToCart, removeFromCart, clearCart } = useStore();
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = cartItems.reduce((acc, item: CartItemType) => acc + item.price * item.quantity, 0);
            setTotalPrice(total);
        };

        calculateTotalPrice();
    }, [cartItems]);

    return {
        cartItems,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
    };
};

export { useCart };
export default useCart;