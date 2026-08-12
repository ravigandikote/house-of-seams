'use client';

import React from 'react';
import Button from '../ui/Button';
import { useRegion } from '@/lib/region';
import { usePatternCartStore } from '@/store/patternCartStore';
import { CommerceProduct, formatPrice } from '@/types/commerce';

// Add-to-bag button for a pattern — opens the drawer on success.

const AddPatternToBag: React.FC<{ product: CommerceProduct; className?: string }> = ({
    product,
    className = '',
}) => {
    const [region] = useRegion();
    const addProduct = usePatternCartStore((s) => s.addProduct);
    const isBusy = usePatternCartStore((s) => s.isBusy);
    return (
        <Button
            className={className}
            disabled={isBusy || !product.availableForSale}
            onClick={() => addProduct(product, region)}
        >
            {product.availableForSale
                ? `Add to Bag — ${formatPrice(product.price)}`
                : 'Currently unavailable'}
        </Button>
    );
};

export default AddPatternToBag;
