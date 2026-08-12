import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddPatternToBag from '@/components/commerce/AddPatternToBag';
import CommerceNote from '@/components/commerce/CommerceNote';
import DownloadPatternSheet from '@/components/commerce/DownloadPatternSheet';
import PatternSketch from '@/components/commerce/PatternSketch';
import { CornerFlourish, GoldDivider } from '@/components/ui/decor';
import { getPatternListing } from '@/lib/patterns';
import { serverRegion } from '@/lib/regionServer';
import { categoryById } from '@/types/customizerCategories';
import { formatPrice } from '@/types/commerce';
import { DIFFICULTY_LABELS, formatLabels } from '@/types/pattern';

// Pattern detail page: the rendered sketch, what's included, and either
// add-to-bag (Shopify product exists) or a graceful coming-soon state.

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
    const listing = await getPatternListing(params.handle, 'IN');
    if (!listing) return { title: 'Pattern | House of Seams' };
    return {
        title: `${listing.profile.title} — Sewing Pattern | House of Seams`,
        description: `${listing.profile.title} digital sewing pattern: ${listing.profile.sizeRange}, ${formatLabels(listing.profile.formats).join(', ')}. From the House of Seams atelier.`,
    };
}

const PatternDetailPage = async ({ params }: { params: { handle: string } }) => {
    const region = serverRegion();
    const listing = await getPatternListing(params.handle, region);
    if (!listing) notFound();
    const { profile, product } = listing;

    // Cross-link into the matching bespoke journey where one exists.
    const customizerCategory = categoryById(profile.category);
    const bespokeHref = customizerCategory?.available ? `/customize?category=${profile.category}` : '/customize';

    const structuredData = product
        ? {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: profile.title,
              description: `${profile.title} digital sewing pattern from House of Seams`,
              sku: profile.shopifyHandle,
              brand: { '@type': 'Brand', name: 'House of Seams' },
              offers: {
                  '@type': 'Offer',
                  price: product.price.amount,
                  priceCurrency: product.price.currencyCode,
                  availability: product.availableForSale
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
              },
          }
        : null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}
            <p className="label-caps text-champagne-gold-dark text-center mb-3">
                <Link href="/patterns" className="hover:text-deep-rose transition-colors">The Pattern Shop</Link>
                {' · '}{labelize(profile.category)}
            </p>
            <h1 className="font-heading text-display-lg text-center text-ink mb-3">{profile.title}</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">
                {DIFFICULTY_LABELS[profile.difficulty]} · {profile.sizeRange}
            </p>
            <GoldDivider className="mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-8 h-fit">
                    <CornerFlourish position="tl" />
                    <CornerFlourish position="br" />
                    <PatternSketch previewConfig={profile.previewConfig} className="max-w-xs mx-auto" />
                    <p className="font-accent italic text-body-sm text-warm-gray text-center mt-2">
                        Drawn from the pattern&apos;s own measurements
                    </p>
                </div>

                <div>
                    <p className="label-caps text-champagne-gold-dark mb-2">What&apos;s included</p>
                    <ul className="space-y-2 mb-6">
                        {profile.whatsIncluded.map((item) => (
                            <li key={item} className="flex gap-3 text-body-sm text-charcoal">
                                <span className="text-champagne-gold mt-0.5" aria-hidden="true">◆</span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <dl className="space-y-2 text-body-sm mb-6">
                        <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                            <dt className="text-warm-gray">Formats</dt>
                            <dd className="text-charcoal text-right">{formatLabels(profile.formats).join(' · ')}</dd>
                        </div>
                        <div className="flex justify-between border-b border-champagne-gold/15 pb-2">
                            <dt className="text-warm-gray">Sizes</dt>
                            <dd className="text-charcoal">{profile.sizeRange}</dd>
                        </div>
                        {profile.fabricNotes && (
                            <div className="pt-1">
                                <dt className="text-warm-gray mb-1">Fabric notes</dt>
                                <dd className="text-charcoal">{profile.fabricNotes}</dd>
                            </div>
                        )}
                    </dl>

                    {product ? (
                        <>
                            <AddPatternToBag product={product} className="w-full" />
                            {product.id.startsWith('demo-') && (
                                <p className="label-caps text-[9px] text-warm-gray text-center mt-2">
                                    Sample price — the shop opens soon
                                </p>
                            )}
                            <CommerceNote kind="digital" className="text-center mt-2" />
                            <p className="text-caption text-warm-gray text-center mt-1">
                                {' '}
                                <Link href="/patterns/thank-you" className="link-gold">
                                    printing &amp; assembly guide
                                </Link>
                            </p>
                            {/* TEMPORARY while checkout is not live. */}
                            <DownloadPatternSheet
                                profile={profile}
                                priceLine={formatPrice(product.price)}
                                className="mt-4"
                            />
                        </>
                    ) : (
                        <div className="bg-blush/60 border border-champagne-gold/25 rounded-sm p-4 text-center">
                            <p className="label-caps text-champagne-gold-dark mb-1">Coming soon</p>
                            <p className="text-body-sm text-warm-gray">
                                This pattern is being prepared for the shop — check back shortly.
                            </p>
                            {/* TEMPORARY while checkout is not live. */}
                            <DownloadPatternSheet profile={profile} className="mt-4" />
                        </div>
                    )}

                    <div className="mt-8 border border-champagne-gold/40 rounded-sm p-5 relative">
                        <CornerFlourish position="tr" />
                        <p className="font-accent italic text-lede text-ink mb-2">Prefer it stitched?</p>
                        <p className="text-body-sm text-warm-gray mb-3">
                            Design this {labelize(profile.category).toLowerCase()} with Kavya and the
                            atelier will cut it to your exact measurements.
                        </p>
                        <Link href={bespokeHref} className="link-gold text-body-sm">
                            Design it with Kavya →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternDetailPage;
