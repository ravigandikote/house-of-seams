import React from 'react';

// Small shipping/tax note under commerce CTAs. Digital goods ship
// nowhere; physical goods are priced and shipped by the Shopify
// checkout — we never estimate either ourselves.

const COPY = {
    digital: 'Instant download — no shipping. Prices include applicable taxes.',
    physical: 'Shipping and any duties are calculated at secure checkout.',
} as const;

const CommerceNote: React.FC<{ kind: keyof typeof COPY; className?: string }> = ({
    kind,
    className = '',
}) => (
    <p className={`text-caption text-warm-gray ${className}`}>{COPY[kind]}</p>
);

export default CommerceNote;
