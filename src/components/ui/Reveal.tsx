'use client';

import React, { useEffect, useRef } from 'react';

// Fade/slide-up a section as it scrolls into view. Progressive by
// construction: the server never sends the hiding class, so users
// without JavaScript (or with reduced motion) always see content.

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    /** Extra transition delay in ms for simple stagger effects. */
    delay?: number;
}

const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // Already in the initial viewport? Don't hide it at all.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

        el.classList.add('reveal-pending');
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        el.classList.add('reveal-shown');
                        el.classList.remove('reveal-pending');
                        observer.disconnect();
                    }
                }
            },
            { rootMargin: '0px 0px -8% 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
            {children}
        </div>
    );
};

export default Reveal;
