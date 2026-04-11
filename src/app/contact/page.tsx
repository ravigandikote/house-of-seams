import React from 'react';
import ContactForm from '../../components/contact/ContactForm';
import GoogleMap from '../../components/contact/GoogleMap';

const ContactPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p className="mb-6">
                We would love to hear from you! Please fill out the form below or reach out to us through our social media channels.
            </p>
            <ContactForm />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Find Us Here</h2>
                <GoogleMap />
            </div>
        </div>
    );
};

export default ContactPage;