"use client";

import React from 'react';
import Link from 'next/link';

const MobileNav = ({ isOpen, toggleNav }: { isOpen: boolean; toggleNav: () => void }) => {
    const links = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/collections', label: 'Collections' },
        { href: '/products', label: 'Products' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/testimonials', label: 'Testimonials' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
        { href: '/faqs', label: 'FAQs' },
    ];

    return (
        <div className={`fixed top-0 left-0 w-full h-full bg-white transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-heading text-lg font-bold text-dusty-rose">House of Seams</h2>
                <button onClick={toggleNav} className="text-xl text-charcoal hover:text-dusty-rose transition-colors">&#10006;</button>
            </div>
            <nav className="flex flex-col p-4">
                {links.map((link) => (
                    <Link key={link.href} href={link.href} className="py-3 text-charcoal hover:text-dusty-rose transition-colors duration-200 border-b border-gray-100" onClick={toggleNav}>
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default MobileNav;
