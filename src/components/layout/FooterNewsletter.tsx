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
            <h4 className="label-caps text-champagne-gold-light mb-5">Newsletter</h4>
            <p className="text-cream/60 text-body-sm mb-4">Stay updated with our latest collections and offers.</p>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2.5">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="!bg-white/5 !border-champagne-gold/30 text-cream placeholder-cream/40 px-3 py-2.5 rounded-sm focus:!border-champagne-gold transition-colors duration-300"
                />
                <button
                    type="submit"
                    className="label-caps bg-deep-rose text-white px-4 py-2.5 rounded-sm hover:bg-deep-rose-dark transition-colors duration-300"
                >
                    Subscribe
                </button>
            </form>
            {success && <p className="text-sage-green-light mt-2 text-body-sm">Thank you for subscribing!</p>}
            {error && <p className="text-red-300 mt-2 text-body-sm">{error}</p>}
        </div>
    );
};

export default FooterNewsletter;
