import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items, shippingAddress } = await request.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 });
  }

  // Verify prices server-side
  const adminSupabase = createAdminClient();
  const productIds = items.map((i: any) => i.productId);
  const { data: products } = await adminSupabase.from('products').select('id, price, name, image').in('id', productIds);

  if (!products || products.length !== items.length) {
    return NextResponse.json({ error: 'Invalid products' }, { status: 400 });
  }

  const totalAmount = items.reduce((sum: number, item: any) => {
    const product = products.find((p: any) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const amountInPaise = Math.round(totalAmount * 100);

  // Create Razorpay order
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET!;
  const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');

  const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    }),
  });

  if (!rzpResponse.ok) {
    const err = await rzpResponse.text();
    return NextResponse.json({ error: 'Failed to create Razorpay order', details: err }, { status: 500 });
  }

  const rzpOrder = await rzpResponse.json();

  // Create pending order in DB
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      currency: 'INR',
      shipping_address: shippingAddress || null,
      razorpay_order_id: rzpOrder.id,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Insert order items
  const orderItems = items.map((item: any) => {
    const product = products.find((p: any) => p.id === item.productId);
    return {
      order_id: order.id,
      product_id: item.productId,
      product_name: product?.name || item.name,
      product_image: product?.image || '',
      quantity: item.quantity,
      unit_price: product?.price || 0,
      total_price: (product?.price || 0) * item.quantity,
    };
  });

  await adminSupabase.from('order_items').insert(orderItems);

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: amountInPaise,
    currency: 'INR',
  });
}
