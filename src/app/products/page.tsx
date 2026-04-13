import React from 'react';
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
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal">Our Products</h1>
            <p className="text-center text-warm-gray mb-10">Handcrafted pieces for every occasion</p>
            <ProductGrid products={products} />
        </div>
    );
};

export default ProductsPage;
