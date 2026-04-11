"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/providers/AuthProvider';

const accountNav = [
    { href: '/account/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { href: '/account/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '/account/addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { href: '/account/wishlist', label: 'Wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuthContext();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dusty-rose"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Middleware redirects to login
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal mb-8">My Account</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-56 flex-shrink-0">
                    <nav className="space-y-1">
                        {accountNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${pathname.startsWith(item.href)
                                        ? 'bg-dusty-rose text-white'
                                        : 'text-charcoal hover:bg-gray-100'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                </svg>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}
