import React from 'react';
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
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal">Gallery</h1>
            <p className="text-center text-warm-gray mb-10">A glimpse into our world of elegance</p>
            <GalleryGrid images={images} />
        </div>
    );
};

export default GalleryPage;
