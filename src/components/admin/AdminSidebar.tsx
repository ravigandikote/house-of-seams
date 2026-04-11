'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: '|||' },
  { label: 'Products', href: '/admin/products', icon: '\u25A1' },
  { label: 'Categories', href: '/admin/categories', icon: '\u2630' },
  { label: 'Gallery', href: '/admin/gallery', icon: '\u25A3' },
  { label: 'Blog', href: '/admin/blog', icon: '\u270E' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: '\u201C' },
  { label: 'FAQs', href: '/admin/faqs', icon: '?' },
  { label: 'Pricing', href: '/admin/pricing', icon: '$' },
  { label: 'Media', href: '/admin/media', icon: '\u2191' },
  { label: 'Bookings', href: '/admin/bookings', icon: '\u2611' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="font-heading text-lg font-bold text-charcoal">Menu</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            &times;
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-dusty-rose/10 text-dusty-rose'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-charcoal'
                  }`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
