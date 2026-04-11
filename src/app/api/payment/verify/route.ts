import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();

  // Verify HMAC signature
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  const adminSupabase = createAdminClient();

  if (isValid) {
    await adminSupabase
      .from('orders')
      .update({
        razorpay_payment_id,
        payment_status: 'paid',
        status: 'confirmed',
      })
      .eq('id', orderId);

    return NextResponse.json({ success: true, orderId });
  } else {
    await adminSupabase
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
      })
      .eq('id', orderId);

    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
  }
}
