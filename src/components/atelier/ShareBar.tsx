'use client';

import React, { useEffect, useState } from 'react';

// Share affordances for the Design Story page: copy the private link, or
// send it over WhatsApp. The URL is read from the browser on mount so the
// server render never needs to know its own origin.

const ShareBar: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [url, setUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url || window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard can be unavailable (http, older browsers) — select-less
            // fallback: show the prompt so the link can still be copied by hand.
            window.prompt('Copy your Design Story link:', url || window.location.href);
        }
    };

    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
        `See my custom design by House of Seams: ${url}`
    )}`;

    return (
        <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
            <button
                type="button"
                onClick={handleCopy}
                className="label-caps px-5 py-2.5 rounded-full border border-champagne-gold/50 bg-ivory text-charcoal hover:border-deep-rose hover:text-deep-rose transition-colors duration-300"
            >
                {copied ? 'Link copied ✓' : 'Copy private link'}
            </button>
            <a
                href={url ? whatsappHref : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-deep-rose text-white hover:bg-deep-rose-dark transition-colors duration-300"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.5 2 2 6.4 2 11.8c0 1.9.55 3.7 1.5 5.2L2 22l5.2-1.4c1.45.8 3.1 1.2 4.8 1.2 5.5 0 10-4.4 10-9.9S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3c-.85-1.3-1.3-2.85-1.3-4.4C3.7 7.4 7.4 3.8 12 3.8s8.3 3.6 8.3 8-3.7 8.2-8.3 8.2zm4.6-6.1c-.25-.13-1.5-.73-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.74-.65-1.24-1.45-1.38-1.7-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.77-1.83-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.5-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.11-.23-.17-.48-.3z" />
                </svg>
                Share on WhatsApp
            </a>
        </div>
    );
};

export default ShareBar;
