import { createClient } from '../lib/supabase/client';

const supabase = createClient();

export const processPayment = async (paymentData) => {
    try {
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
    } catch (error) {
        console.error('Payment processing error:', error);
        throw new Error('Payment processing failed');
    }
};

export const getPaymentStatus = async (paymentId) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching payment status:', error);
        throw new Error('Failed to fetch payment status');
    }
};