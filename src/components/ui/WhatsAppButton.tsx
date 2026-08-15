'use client';

import React from 'react';

// Floating "chat with us" bubble.
//
// It MUST NOT be rendered inside <header>: the header carries
// backdrop-blur, and a backdrop-filter makes its element the containing
// block for position:fixed descendants — which pinned this bubble to the
// bottom-right of the header bar, directly on top of the mobile menu
// toggle. Kept as a sibling of the header so `fixed` means the viewport.

// Digits only, no + or spaces (wa.me's format).
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const WhatsAppButton = () => {
    // No number configured = no dead bubble. wa.me rejects a placeholder
    // with an error page, which is worse than not offering the channel.
    if (!WHATSAPP_NUMBER) return null;

    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            // z-30 keeps it under the drawers/modals (z-40+) but above page
            // content; the safe-area inset lifts it clear of the iOS home bar.
            className="fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-colors duration-300 touch-manipulation active:bg-green-600 [@media(hover:hover)]:hover:bg-green-600"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <img src="/whatsapp-icon.svg" alt="" aria-hidden="true" className="h-6 w-6" />
        </a>
    );
};

export { WhatsAppButton };
export default WhatsAppButton;
