import React from 'react';

const PoliciesPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Policies</h1>
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Return Policy</h2>
                <p>
                    At House of Seams, we take pride in our craftsmanship and quality. If you are not satisfied with your purchase, you may return it within 30 days for a full refund or exchange, provided the item is in its original condition.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Shipping Policy</h2>
                <p>
                    We offer standard and express shipping options. All orders are processed within 2-3 business days. Delivery times may vary based on your location.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Privacy Policy</h2>
                <p>
                    Your privacy is important to us. We do not share your personal information with third parties without your consent. Please refer to our full privacy policy for more details.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Terms of Service</h2>
                <p>
                    By using our website, you agree to comply with our terms of service. Please read them carefully before making a purchase.
                </p>
            </section>
        </div>
    );
};

export default PoliciesPage;