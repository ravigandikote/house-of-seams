'use client';

import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import CommerceNote from './CommerceNote';
import { demoProductByHandle, getProductByHandle, isCommerceConfigured } from '@/lib/shopify';
import { useRegion } from '@/lib/region';
import { usePatternCartStore } from '@/store/patternCartStore';
import { CommerceProduct, formatPrice } from '@/types/commerce';

// Live Shopify price + add-to-bag for a PHYSICAL product that has a
// shopify_handle. Renders nothing while loading and nothing at all when
// the handle has no product (in Shopify or the demo fixtures) — the
// page's existing enquiry-style behaviour then stands untouched.

const ProductCommerce: React.FC<{ shopifyHandle: string; className?: string }> = ({
    shopifyHandle,
    className = '',
}) => {
    const [region] = useRegion();
    const [product, setProduct] = useState<CommerceProduct | null>(null);
    const addProduct = usePatternCartStore((s) => s.addProduct);
    const isBusy = usePatternCartStore((s) => s.isBusy);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // Demo mode only prices explicitly-demo handles: a real
                // product's handle must never show a sample price as real.
                const result = isCommerceConfigured()
                    ? await getProductByHandle(shopifyHandle, region)
                    : shopifyHandle.startsWith('demo-')
                      ? demoProductByHandle(shopifyHandle, region)
                      : null;
                if (!cancelled) setProduct(result);
            } catch {
                if (!cancelled) setProduct(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [shopifyHandle, region]);

    if (!product) return null;

    return (
        <div className={className}>
            <p className="font-heading text-headline text-ink mb-3">{formatPrice(product.price)}</p>
            <Button
                disabled={isBusy || !product.availableForSale}
                onClick={() => addProduct(product, region)}
            >
                {product.availableForSale ? 'Add to Bag' : 'Currently unavailable'}
            </Button>
            <CommerceNote kind="physical" className="mt-2" />
        </div>
    );
};

export default ProductCommerce;
