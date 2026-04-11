"use client";

import React from 'react';
import BookingForm from '../../components/booking/BookingForm';
import BookingCalendar from '../../components/booking/BookingCalendar';
import BookingConfirmation from '../../components/booking/BookingConfirmation';

const BookingPage = () => {
    const [bookingConfirmed, setBookingConfirmed] = React.useState(false);

    const handleBookingConfirmation = () => {
        setBookingConfirmed(true);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
            {!bookingConfirmed ? (
                <>
                    <BookingCalendar onConfirm={handleBookingConfirmation} />
                    <BookingForm onConfirm={handleBookingConfirmation} />
                </>
            ) : (
                <BookingConfirmation />
            )}
        </div>
    );
};

export default BookingPage;