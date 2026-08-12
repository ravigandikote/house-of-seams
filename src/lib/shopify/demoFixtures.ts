// Commerce demo mode fixtures — shown wherever products would render
// while the Shopify store doesn't exist yet (or env vars are
// placeholders), so every commerce surface is reviewable end-to-end.
// Prices switch with the region exactly like Markets will.

import { CommerceProduct, Region } from '@/types/commerce';

interface DemoSeed {
    handle: string;
    title: string;
    description: string;
    inr: number;
    usd: number;
}

const DEMO_SEEDS: DemoSeed[] = [
    {
        handle: 'demo-silver-jhumka-earrings',
        title: 'Silver Jhumka Earrings',
        description:
            'Handpicked oxidised-silver jhumkas from the boutique’s jewellery shelf. A demo physical product for the commerce rail.',
        inr: 2499,
        usd: 34,
    },
    {
        handle: 'princess-cut-blouse-pattern',
        title: 'Princess Cut Blouse — Sewing Pattern',
        description:
            'The most forgiving of the classic saree-blouse cuts, with panel seams that shape without darts. Sizes 32–44, A4 + A0 PDF.',
        inr: 499,
        usd: 12,
    },
    {
        handle: 'kalidar-lehenga-8-pattern',
        title: '8-Kali Lehenga Skirt — Sewing Pattern',
        description:
            'A traditional eight-panel kalidar skirt with a gentle sweep. Waist 26–44, A4 + A0 PDF with assembly guide.',
        inr: 699,
        usd: 16,
    },
    {
        handle: 'straight-kurti-pattern',
        title: 'Straight Kurti — Sewing Pattern',
        description:
            'A clean straight-fall kurti with side slits and three neckline options. Sizes XS–3XL, A4 + A0 + projector PDF.',
        inr: 549,
        usd: 13,
    },
    {
        handle: 'bodice-block-pattern',
        title: 'Personal Bodice Block — Foundation Pattern',
        description:
            'The foundation every fitted garment starts from. Draft-along instructions for a made-to-measure block.',
        inr: 399,
        usd: 10,
    },
];

export function demoProducts(region: Region): CommerceProduct[] {
    return DEMO_SEEDS.map((seed, i) => ({
        id: `demo-product-${i + 1}`,
        handle: seed.handle,
        title: seed.title,
        description: seed.description,
        price:
            region === 'US'
                ? { amount: seed.usd.toFixed(2), currencyCode: 'USD' }
                : { amount: String(seed.inr), currencyCode: 'INR' },
        imageUrl: null,
        availableForSale: true,
        variantId: `demo-variant-${i + 1}`,
    }));
}

export function demoProductByHandle(handle: string, region: Region): CommerceProduct | null {
    return demoProducts(region).find((p) => p.handle === handle) ?? null;
}
