import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import InstagramFeed from '../components/home/InstagramFeed';
import productsJson from '@/data/products.json';
import categoriesJson from '@/data/categories.json';

const HomePage = async () => {
    const supabase = createClient();
    let products: any[] = [];
    let categories: any[] = [];

    if (supabase) {
        const [productsRes, categoriesRes] = await Promise.all([
            supabase.from('products').select('*').eq('is_featured', true),
            supabase.from('categories').select('*'),
        ]);
        products = toCamelCase(productsRes.data || []) as any[];
        categories = toCamelCase(categoriesRes.data || []) as any[];
    } else {
        products = (productsJson as any[]).filter((p: any) => p.isFeatured);
        categories = categoriesJson as any[];
    }

    return (
        <div>
            <Hero />
            <Categories categories={categories} />
            <FeaturedProducts products={products} />
            <InstagramFeed />
        </div>
    );
};

export default HomePage;
