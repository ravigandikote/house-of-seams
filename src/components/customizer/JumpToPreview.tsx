'use client';

import React, { useEffect, useState } from 'react';

// Mobile-only "back to the sketch" pill.
//
// Deliberately self-hiding: it appears only while the preview section is
// off-screen, so it never sits on top of the very drawing it points at.
// On the measurement steps the sketch is pinned and this stays hidden; on
// the long Preview & Submit form it appears as soon as you scroll past it.
//
// Sits bottom-CENTRE — the bottom-right corner belongs to the WhatsApp
// bubble, and two floating circles fighting for the same thumb is worse
// than either alone.

const JumpToPreview: React.FC<{ label?: string }> = ({ label = 'View sketch' }) => {
    const [isOffScreen, setIsOffScreen] = useState(false);

    useEffect(() => {
        const target = document.querySelector('[data-preview-section]');
        if (!target) return;
        // threshold 0, deliberately: the preview column is often taller than
        // the screen, and any ratio above 0 is then unreachable — which read
        // as "off screen" while the sketch was in plain sight.
        const observer = new IntersectionObserver(
            ([entry]) => setIsOffScreen(!entry.isIntersecting),
            { threshold: 0 },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    if (!isOffScreen) return null;

    const jump = () => {
        const target = document.querySelector('[data-preview-section]');
        if (!target) return;
        const reduced =
            typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };

    return (
        <button
            type="button"
            onClick={jump}
            className="md:hidden fixed left-1/2 -translate-x-1/2 z-30 label-caps inline-flex items-center gap-2 min-h-[44px] rounded-full bg-deep-rose px-5 text-white shadow-lift transition-colors duration-300 touch-manipulation active:bg-deep-rose-dark animate-fade-in"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            {label}
        </button>
    );
};

export default JumpToPreview;
