import React from 'react';
import Link from 'next/link';
import { GoldDivider } from '@/components/ui/decor';

// Shown for unknown/expired atelier tokens. Deliberately unrevealing:
// it never confirms whether a request exists.

const AtelierNotFound = () => (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <GoldDivider className="mb-8" />
        <p className="label-caps text-champagne-gold-dark mb-3">The Atelier Journal</p>
        <h1 className="font-heading text-display text-ink mb-4">This page of the journal is blank</h1>
        <p className="font-accent italic text-lede text-warm-gray max-w-md mx-auto mb-8">
            We couldn&apos;t find a Design Story at this address. If someone shared a link with you,
            ask them to send it once more — every character matters.
        </p>
        <div className="flex gap-6 justify-center">
            <Link href="/" className="link-gold text-body-sm">Return home</Link>
            <Link href="/customize" className="link-gold text-body-sm">Begin your own design</Link>
        </div>
        <GoldDivider className="mt-10" />
    </div>
);

export default AtelierNotFound;
