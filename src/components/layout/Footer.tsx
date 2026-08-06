import React from 'react';
import FooterLinks from './FooterLinks';
import FooterNewsletter from './FooterNewsletter';
import FooterSocial from './FooterSocial';

const Footer = () => {
    return (
        <footer className="bg-ink text-cream pt-14 pb-8">
            <div className="max-w-6xl mx-auto px-5">
                <div className="text-center mb-12">
                    <p className="font-heading text-headline text-cream">House of Seams</p>
                    <p className="font-accent italic text-lede text-cream/60 mt-1">
                        Stitched with intention, worn with joy.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-5" aria-hidden="true">
                        <span className="h-px w-24 bg-gradient-to-r from-transparent to-champagne-gold/60" />
                        <svg width="26" height="12" viewBox="0 0 26 12" className="text-champagne-gold">
                            <path d="M13 1 C15.5 4 19 5.5 22 6 C19 6.5 15.5 8 13 11 C10.5 8 7 6.5 4 6 C7 5.5 10.5 4 13 1 Z" fill="currentColor" opacity="0.9" />
                            <circle cx="1.5" cy="6" r="1.2" fill="currentColor" opacity="0.6" />
                            <circle cx="24.5" cy="6" r="1.2" fill="currentColor" opacity="0.6" />
                        </svg>
                        <span className="h-px w-24 bg-gradient-to-l from-transparent to-champagne-gold/60" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FooterLinks />
                    <FooterNewsletter />
                    <FooterSocial />
                </div>
                <div className="border-t border-champagne-gold/20 mt-12 pt-6 text-center">
                    <p className="text-cream/50 text-body-sm">
                        &copy; {new Date().getFullYear()} House of Seams. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
