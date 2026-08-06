import React from 'react';
import { GoldDivider } from '../../components/ui/decor';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import ProductGrid from '../../components/products/ProductGrid';
import productsJson from '@/data/products.json';

const ProductsPage = async () => {
    const supabase = createClient();
    let products: any[] = [];

    if (supabase) {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        products = toCamelCase(data || []) as any[];
    } else {
        products = productsJson as any[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Collection</p>
            <h1 className="font-heading text-display-lg text-center mb-3 text-ink">Our Products</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">Handcrafted pieces for every occasion</p>
            <GoldDivider className="mb-10" />
            <ProductGrid products={products} />
        </div>
    );
};

export default ProductsPage;
