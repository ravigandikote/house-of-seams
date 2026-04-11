"use client";

import React, { useState } from 'react';

const FooterNewsletter = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (re.test(String(email).toLowerCase())) {
            setSuccess(true);
            setError('');
            setEmail('');
        } else {
            setError('Please enter a valid email address.');
        }
    };

    return (
        <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-3">Stay updated with our latest collections and offers.</p>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:border-dusty-rose transition-colors duration-200"
                />
                <button
                    type="submit"
                    className="bg-dusty-rose text-white px-4 py-2 rounded hover:bg-dusty-rose-dark transition-colors duration-200"
                >
                    Subscribe
                </button>
            </form>
            {success && <p className="text-green-300 mt-2 text-sm">Thank you for subscribing!</p>}
            {error && <p className="text-red-300 mt-2 text-sm">{error}</p>}
        </div>
    );
};

export default FooterNewsletter;
