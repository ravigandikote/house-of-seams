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
        { href: '/contact', label: 'Contact' },
        { href: '/faqs', label: 'FAQs' },
    ];

    return (
        <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="list-none space-y-2">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-gray-300 hover:text-dusty-rose transition-colors duration-200">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FooterLinks;
