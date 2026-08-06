"use client";

import React, { useState } from 'react';

// Footer newsletter signup — feeds the boutique's customer database via
// /api/customers/subscribe (source: newsletter).

const FooterNewsletter = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email.trim().toLowerCase())) {
            setError('Please enter a valid email address.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/customers/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            if (!res.ok) {
                const body = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(body?.error || 'Something went wrong — please try again.');
            }
            setSuccess(true);
            setEmail('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h4 className="label-caps text-champagne-gold-light mb-5">Newsletter</h4>
            <p className="text-cream/60 text-body-sm mb-4">Stay updated with our latest collections and offers.</p>
            {success ? (
                <p className="font-accent italic text-body text-champagne-gold-light">
                    Welcome to the atelier&apos;s inner circle — we&apos;ll write soon.
                </p>
            ) : (
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
                        disabled={isSubmitting}
                        className="label-caps bg-deep-rose text-white px-4 py-2.5 rounded-sm hover:bg-deep-rose-dark transition-colors duration-300 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Joining…' : 'Subscribe'}
                    </button>
                </form>
            )}
            {error && <p className="text-red-300 mt-2 text-body-sm" role="alert">{error}</p>}
        </div>
    );
};

export default FooterNewsletter;
