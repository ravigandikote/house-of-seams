import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import CollectionGrid from '../../components/collections/CollectionGrid';
import categoriesJson from '@/data/categories.json';

const CollectionsPage = async () => {
    const supabase = createClient();
    let categories: any[] = [];

    if (supabase) {
        const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        categories = toCamelCase(data || []) as any[];
    } else {
        categories = categoriesJson as any[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal">Our Collections</h1>
            <p className="text-center text-warm-gray mb-10">Curated with care, crafted with passion</p>
            <CollectionGrid categories={categories} />
        </div>
    );
};

export default CollectionsPage;
