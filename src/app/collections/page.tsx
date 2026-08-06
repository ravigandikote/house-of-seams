import React from 'react';
import { GoldDivider } from '../../components/ui/decor';
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
            <p className="label-caps text-champagne-gold-dark text-center mb-3">Curated Edits</p>
            <h1 className="font-heading text-display-lg text-center mb-3 text-ink">Our Collections</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">Curated with care, crafted with passion</p>
            <GoldDivider className="mb-10" />
            <CollectionGrid categories={categories} />
        </div>
    );
};

export default CollectionsPage;
