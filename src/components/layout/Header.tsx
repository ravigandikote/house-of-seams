"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { WhatsAppButton } from '../ui/WhatsAppButton';
import { useCartStore } from '../../store/cartStore';

const Header: React.FC = () => {
    const { user, signOut } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const totalItems = useCartStore((s) => s.getTotalItems());

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { href: '/about', label: 'About' },
        { href: '/collections', label: 'Collections' },
        { href: '/products', label: 'Products' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/testimonials', label: 'Testimonials' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-5xl mx-auto flex justify-between items-center px-4 py-4">
                <Link href="/" className="flex flex-col">
                    <span className="font-heading text-2xl font-bold text-dusty-rose hover:text-dusty-rose-dark transition-colors duration-200">
                        House of Seams
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-warm-gray -mt-1">
                        A Contemporary Expression of Lifestyle &amp; Jewellery
                    </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-charcoal hover:text-dusty-rose transition-colors duration-200">
                            {link.label}
                        </Link>
                    ))}

                    {/* Cart icon */}
                    <Link href="/checkout" className="relative text-charcoal hover:text-dusty-rose transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-dusty-rose text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {/* User menu */}
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-1 text-charcoal hover:text-dusty-rose transition-colors duration-200"
                            >
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-dusty-rose text-white flex items-center justify-center text-sm font-medium">
                                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50">
                                        My Account
                                    </Link>
                                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50">
                                        My Orders
                                    </Link>
                                    <Link href="/account/wishlist" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50">
                                        Wishlist
                                    </Link>
                                    <hr className="my-1" />
                                    <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-charcoal hover:text-dusty-rose transition-colors duration-200">Login</Link>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-charcoal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                <WhatsAppButton />
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-charcoal hover:text-dusty-rose">
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/checkout" onClick={() => setMenuOpen(false)} className="block text-charcoal hover:text-dusty-rose">
                        Cart {totalItems > 0 && `(${totalItems})`}
                    </Link>
                    {user ? (
                        <>
                            <Link href="/account" onClick={() => setMenuOpen(false)} className="block text-charcoal hover:text-dusty-rose">My Account</Link>
                            <button onClick={() => { signOut(); setMenuOpen(false); }} className="block text-red-600 hover:text-red-700">Sign Out</button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-charcoal hover:text-dusty-rose">Login</Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
