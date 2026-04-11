import React from 'react';
import { GalleryItem } from '../../types/gallery';

interface GalleryGridProps {
    images: GalleryItem[];
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ images }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-${(index % 4) * 100}`}
                >
                    <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
                        <p className="text-white p-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            {image.alt}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GalleryGrid;
