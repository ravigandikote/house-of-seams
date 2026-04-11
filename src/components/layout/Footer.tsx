import React from 'react';
import FooterLinks from './FooterLinks';
import FooterNewsletter from './FooterNewsletter';
import FooterSocial from './FooterSocial';

const Footer = () => {
    return (
        <footer className="bg-charcoal text-white py-12">
            <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FooterLinks />
                    <FooterNewsletter />
                    <FooterSocial />
                </div>
                <div className="border-t border-white/10 mt-8 pt-6 text-center">
                    <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} House of Seams. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
