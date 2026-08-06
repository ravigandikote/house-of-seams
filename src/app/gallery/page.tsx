import React from 'react';
import { GoldDivider } from '../../components/ui/decor';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import GalleryGrid from '../../components/gallery/GalleryGrid';
import galleryJson from '@/data/gallery.json';

const GalleryPage = async () => {
    const supabase = createClient();
    let images: any[] = [];

    if (supabase) {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        images = toCamelCase(data || []) as any[];
    } else {
        images = galleryJson as any[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Lookbook</p>
            <h1 className="font-heading text-display-lg text-center mb-3 text-ink">Gallery</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">A glimpse into our world of elegance</p>
            <GoldDivider className="mb-10" />
            <GalleryGrid images={images} />
        </div>
    );
};

export default GalleryPage;
