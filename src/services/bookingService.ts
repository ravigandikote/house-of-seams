import { createClient } from '../lib/supabase/client';

const supabase = createClient();
import { Booking } from '../types/booking';

export const createBooking = async (bookingData: Booking) => {
    const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData]);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const getBookings = async () => {
    const { data, error } = await supabase
        .from('bookings')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const deleteBooking = async (id: string) => {
    const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};