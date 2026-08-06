import React from 'react';
import Link from 'next/link';

const FooterLinks = () => {
    const links = [
        { href: '/about', label: 'About Us' },
        { href: '/collections', label: 'Collections' },
        { href: '/products', label: 'Products' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/testimonials', label: 'Testimonials' },
        { href: '/blog', label: 'Blog' },
        { href: '/measurement-guide', label: 'Measurement Guide' },
        { href: '/contact', label: 'Contact' },
        { href: '/faqs', label: 'FAQs' },
    ];

    return (
        <div>
            <h4 className="label-caps text-champagne-gold-light mb-5">Quick Links</h4>
            <ul className="list-none space-y-2.5">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-cream/70 text-body-sm hover:text-champagne-gold-light transition-colors duration-300">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FooterLinks;
