"use client";

import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const BookingCalendar = () => {
    const [date, setDate] = React.useState(new Date());

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };

    return (
        <div className="booking-calendar">
            <h2 className="text-lg font-semibold mb-4">Select a Date for Your Appointment</h2>
            <Calendar
                onChange={handleDateChange}
                value={date}
                className="rounded-lg shadow-md"
            />
            <p className="mt-4">Selected Date: {date.toDateString()}</p>
        </div>
    );
};

export default BookingCalendar;