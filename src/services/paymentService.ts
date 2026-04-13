import { createClient } from '../lib/supabase/client';

const supabase = createClient();

export const processPayment = async (paymentData: any) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('payments')
        .insert([
            {
                amount: paymentData.amount,
                currency: paymentData.currency,
                payment_method: paymentData.paymentMethod,
                status: 'pending',
            },
        ]);
    if (error) throw error;
    return data;
};

export const getPaymentStatus = async (paymentId: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
    if (error) throw error;
    return data;
};
