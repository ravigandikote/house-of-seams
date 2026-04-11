"use client";

import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ContactForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Replace with your API endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setSuccess(true);
            setName('');
            setEmail('');
            setMessage('');
        } catch (err) {
            setError('There was an error submitting your message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
            <textarea
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="p-2 border border-gray-300 rounded"
            />
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">Message sent successfully!</p>}
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
        </form>
    );
};

export default ContactForm;