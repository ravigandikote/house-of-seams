'use client';

import React from 'react';
import Link from 'next/link';

interface AdminTopBarProps {
  onMenuToggle: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-gray-600 hover:text-charcoal p-1"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-heading text-xl font-bold text-charcoal">House of Seams Admin</h1>
      </div>
      <Link
        href="/"
        target="_blank"
        className="text-sm text-dusty-rose hover:text-dusty-rose-dark font-medium flex items-center gap-1"
      >
        View Site
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
    </header>
  );
};

export default AdminTopBar;
