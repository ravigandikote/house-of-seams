import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="text-lg font-bold text-sage-green">
                            House of Seams
                        </Link>
                        <div className="hidden md:flex space-x-4 ml-10">
                            <Link href="/about" className="text-gray-700 hover:text-dusty-rose">
                                About
                            </Link>
                            <Link href="/collections" className="text-gray-700 hover:text-dusty-rose">
                                Collections
                            </Link>
                            <Link href="/products" className="text-gray-700 hover:text-dusty-rose">
                                Products
                            </Link>
                            <Link href="/gallery" className="text-gray-700 hover:text-dusty-rose">
                                Gallery
                            </Link>
                            <Link href="/testimonials" className="text-gray-700 hover:text-dusty-rose">
                                Testimonials
                            </Link>
                            <Link href="/blog" className="text-gray-700 hover:text-dusty-rose">
                                Blog
                            </Link>
                            <Link href="/contact" className="text-gray-700 hover:text-dusty-rose">
                                Contact
                            </Link>
                            <Link href="/booking" className="text-gray-700 hover:text-dusty-rose">
                                Book Appointment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;