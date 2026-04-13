import { createClient } from '../lib/supabase/client';
import { Booking } from '../types/booking';

const supabase = createClient();

export const createBooking = async (bookingData: Booking) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('bookings').insert([bookingData]);
    if (error) throw new Error(error.message);
    return data;
};

export const getBookings = async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('bookings').update(bookingData).eq('id', id);
    if (error) throw new Error(error.message);
    return data;
};

export const deleteBooking = async (id: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
};
