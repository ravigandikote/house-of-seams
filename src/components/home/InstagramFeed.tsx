import React from 'react';
import { SectionHeader } from '../ui/decor';

const InstagramFeed = () => {
    const posts = [
        { id: 1, imageUrl: '/images/ig-1.jpg', caption: 'Bridal elegance redefined' },
        { id: 2, imageUrl: '/images/ig-2.jpg', caption: 'Luxury embroidered saree collection' },
        { id: 3, imageUrl: '/images/ig-3.jpg', caption: 'Custom blouse craftsmanship' },
        { id: 4, imageUrl: '/images/ig-4.jpg', caption: 'Statement jewellery pieces' },
        { id: 5, imageUrl: '/images/ig-5.jpg', caption: 'Bridal couture details' },
        { id: 6, imageUrl: '/images/ig-6.jpg', caption: 'Everyday elegance' },
        { id: 7, imageUrl: '/images/ig-7.jpg', caption: 'Designer blouse collection' },
        { id: 8, imageUrl: '/images/ig-8.jpg', caption: 'Occasion wear inspirations' },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-5xl mx-auto px-4">
                <SectionHeader kicker="From the Studio" title="Follow Along" subline="@houseofseams — daily craft, drape, and detail" className="mb-12" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {posts.map((post) => (
                        <div key={post.id} className="group relative overflow-hidden rounded-lg aspect-square">
                            <img
                                src={post.imageUrl}
                                alt={post.caption}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-dusty-rose/0 group-hover:bg-dusty-rose/40 transition-all duration-300 flex items-center justify-center">
                                <p className="text-white text-sm text-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {post.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;
