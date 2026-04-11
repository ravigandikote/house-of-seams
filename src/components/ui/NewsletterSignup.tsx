"use client";

import React, { useState } from 'react';

const NewsletterSignup = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        try {
            // Replace with your API endpoint
            const response = await fetch('/api/newsletter-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to sign up');
            }

            setSuccess(true);
            setEmail('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="newsletter-signup">
            <h2 className="text-lg font-semibold">Subscribe to our Newsletter</h2>
            <form onSubmit={handleSubmit} className="flex flex-col">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="p-2 border border-gray-300 rounded mb-2"
                    required
                />
                <button type="submit" className="bg-dusty-rose text-white p-2 rounded">
                    Sign Up
                </button>
                {success && <p className="text-green-500 mt-2">Thank you for subscribing!</p>}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default NewsletterSignup;