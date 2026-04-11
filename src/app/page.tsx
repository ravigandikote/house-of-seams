import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import InstagramFeed from '../components/home/InstagramFeed';

const HomePage = async () => {
    const supabase = createClient();
    const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_featured', true),
        supabase.from('categories').select('*'),
    ]);
    const products = toCamelCase(productsRes.data || []) as any[];
    const categories = toCamelCase(categoriesRes.data || []) as any[];

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
