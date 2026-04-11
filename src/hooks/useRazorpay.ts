"use client";

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  const openPayment = ({
    razorpayOrderId,
    amount,
    currency,
    orderId,
    name,
    email,
    phone,
    onSuccess,
    onFailure,
  }: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    orderId: string;
    name?: string;
    email?: string;
    phone?: string;
    onSuccess: (data: any) => void;
    onFailure: (error: any) => void;
  }) => {
    if (!loaded) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: 'House of Seams',
      description: 'Purchase',
      order_id: razorpayOrderId,
      prefill: { name, email, contact: phone },
      theme: { color: '#C4A7A7' },
      handler: async (response: any) => {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
          }),
        });
        const result = await verifyRes.json();
        if (result.success) {
          onSuccess(result);
        } else {
          onFailure(result);
        }
      },
      modal: {
        ondismiss: () => onFailure({ error: 'Payment cancelled' }),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { loaded, openPayment };
}
