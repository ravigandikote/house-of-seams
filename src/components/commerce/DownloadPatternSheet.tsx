'use client';

import React, { useRef, useState } from 'react';
import PatternSketch from './PatternSketch';
import { downloadPatternSheetPdf } from '@/lib/patternSheetPdf';
import { DIFFICULTY_LABELS, PatternProfile, formatLabels } from '@/types/pattern';

// TEMPORARY: stands in while Shopify checkout is not live, so a visitor
// leaves with something. It downloads a pattern INFORMATION sheet — the
// sketch and specs — not the sewing pattern, and the button copy says so.
// Remove this component (and its use on /patterns/[handle]) once the real
// files are delivered through Shopify's Digital Downloads app.

interface DownloadPatternSheetProps {
    profile: PatternProfile;
    /** Formatted live price, when Shopify has the product. */
    priceLine?: string | null;
    className?: string;
}

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const DownloadPatternSheet: React.FC<DownloadPatternSheetProps> = ({
    profile,
    priceLine = null,
    className = '',
}) => {
    // Off-screen (not display:none — the rasteriser measures the sketch).
    const sketchRef = useRef<HTMLDivElement>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (!sketchRef.current) return;
        setError(null);
        setIsBusy(true);
        try {
            await downloadPatternSheetPdf(
                {
                    title: profile.title,
                    categoryLine: `${labelize(profile.category)}  ·  ${labelize(profile.patternType)}`,
                    difficultyLabel: DIFFICULTY_LABELS[profile.difficulty],
                    sizeRange: profile.sizeRange,
                    formats: formatLabels(profile.formats),
                    fabricNotes: profile.fabricNotes,
                    whatsIncluded: profile.whatsIncluded,
                    priceLine,
                },
                sketchRef.current,
            );
        } catch {
            setError('Could not build the sheet — please try again.');
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <div className={className}>
            <button
                type="button"
                onClick={handleDownload}
                disabled={isBusy}
                className="label-caps w-full min-h-[44px] inline-flex items-center justify-center rounded-sm border border-champagne-gold/50 bg-ivory px-6 py-3 text-champagne-gold-dark transition-colors duration-300 touch-manipulation active:border-deep-rose active:text-deep-rose disabled:opacity-50 [@media(hover:hover)]:hover:border-deep-rose [@media(hover:hover)]:hover:text-deep-rose"
            >
                {isBusy ? 'Preparing…' : 'Download pattern sheet (PDF)'}
            </button>
            <p className="text-caption text-warm-gray text-center mt-1.5">
                Specs and sketch to plan with — the tiled pattern files come with your purchase.
            </p>
            {error && (
                <p className="text-caption text-deep-rose text-center mt-1" role="alert">
                    {error}
                </p>
            )}

            {/* Rendered off-screen so it has real dimensions to rasterise. */}
            <div aria-hidden="true" className="fixed -left-[3000px] top-0 pointer-events-none">
                <div ref={sketchRef} className="w-[320px] bg-ivory p-4">
                    <PatternSketch previewConfig={profile.previewConfig} />
                </div>
            </div>
        </div>
    );
};

export default DownloadPatternSheet;
