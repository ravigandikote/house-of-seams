"use client";

import React, { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { Button, Input } from '../ui';

const BookingForm = () => {
    const { bookAppointment } = useBooking();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookingData = { name, email, date, time, message };
        bookAppointment(bookingData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />
            <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
            />
            <Input
                as="textarea"
                placeholder="Additional Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit">Book Appointment</Button>
        </form>
    );
};

export default BookingForm;