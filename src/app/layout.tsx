import React from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../components/providers/AuthProvider';
import '../styles/globals.css';

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
});

export const metadata = {
    title: 'House of Seams | Contemporary Fashion & Jewellery',
    description: 'A contemporary expression of lifestyle and jewellery. Custom blouses, bridal couture, and curated collections.',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    const headersList = headers();
    const pathname = headersList.get('x-pathname') || '';
    const isAdmin = pathname.startsWith('/admin');

    return (
        <html lang="en">
            <body className={`${playfair.variable} ${inter.variable} font-body bg-cream text-charcoal`}>
                <AuthProvider>
                    {isAdmin ? (
                        <>{children}</>
                    ) : (
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow">{children}</main>
                            <Footer />
                        </div>
                    )}
                </AuthProvider>
            </body>
        </html>
    );
};

export default RootLayout;
