"use client";

import { useState } from 'react';
import { createBooking } from '../services/bookingService';

const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const bookAppointment = async (bookingData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await createBooking(bookingData);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        success,
        bookAppointment,
    };
};

export { useBooking };
export default useBooking;