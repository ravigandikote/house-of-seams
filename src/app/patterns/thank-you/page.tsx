import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CornerFlourish, GoldDivider } from '@/components/ui/decor';

// Post-purchase guidance — linked from pattern pages and (via Shopify's
// order-confirmation email) after checkout. Delivery itself is handled
// entirely by Shopify's digital-downloads app.

export const metadata: Metadata = {
    title: 'Your Pattern Has Arrived | House of Seams',
    robots: { index: false, follow: false },
};

const STEPS = [
    {
        title: 'Download from your email',
        text: 'Your download link arrives within minutes of payment, from our Shopify store. Check spam/promotions the first time — and save the PDF somewhere you’ll find it again.',
    },
    {
        title: 'Print at home (A4) or at a copy shop (A0)',
        text: 'For A4: print at 100% scale — never "fit to page" — and check the test square on page one with a ruler before printing the rest. For A0: send the A0 file to any print/copy shop and ask for a plain engineering print.',
    },
    {
        title: 'Assemble the sheets',
        text: 'A4 pages tile in the order marked on each sheet — trim the right and bottom margins, match the letter/number pairs, and tape as you go. A glue stick and a long ruler make it pleasant.',
    },
    {
        title: 'Cut your size — and trust the chart',
        text: 'Sizes are layered in the PDF: turn off the layers you don’t need before printing. Measure yourself against the size chart rather than ready-to-wear sizes; couture fits start from real numbers.',
    },
];

const PatternThankYouPage = () => (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <p className="label-caps text-champagne-gold-dark text-center mb-3">The Pattern Shop</p>
        <h1 className="font-heading text-display-lg text-center text-ink mb-3">
            Your pattern has arrived
        </h1>
        <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">
            A few minutes of preparation now makes the sewing hours sing. Here is how we
            print, assemble, and begin.
        </p>
        <GoldDivider className="mb-10" />

        <ol className="space-y-6 mb-12">
            {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                    <span className="flex-none w-9 h-9 rounded-full bg-ivory border border-champagne-gold text-champagne-gold-dark font-heading flex items-center justify-center">
                        {i + 1}
                    </span>
                    <div>
                        <h2 className="font-heading text-title text-ink mb-1">{step.title}</h2>
                        <p className="text-body-sm text-warm-gray">{step.text}</p>
                    </div>
                </li>
            ))}
        </ol>

        <div className="relative bg-blush/50 border border-champagne-gold/30 rounded-sm p-6 text-center mb-8">
            <CornerFlourish position="tl" />
            <CornerFlourish position="br" />
            <p className="font-accent italic text-lede text-charcoal mb-2">Stuck mid-seam?</p>
            <p className="text-body-sm text-warm-gray mb-4">
                Write to the boutique from the <Link href="/contact" className="link-gold">contact page</Link>{' '}
                with a photo of where you are — we answer sewing questions gladly. And if a
                fit puzzle deserves real attention,{' '}
                <Link href="/booking" className="link-gold">book a private consultation</Link>{' '}
                — the ₹500 fee counts toward any order.
            </p>
            <Link
                href="/measurement-guide"
                className="label-caps inline-block bg-deep-rose text-white hover:bg-deep-rose-dark transition-colors duration-300 rounded-sm px-6 py-3"
            >
                Open the Measurement Guide
            </Link>
        </div>

        <p className="text-center">
            <Link href="/patterns" className="link-gold text-body-sm">← Back to the Pattern Shop</Link>
        </p>
    </div>
);

export default PatternThankYouPage;
