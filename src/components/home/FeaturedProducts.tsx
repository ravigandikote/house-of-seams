import React from 'react';
import ProductCard from '../products/ProductCard';
import { SectionHeader } from '../ui/decor';

interface FeaturedProductsProps {
    products: any[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
    return (
        <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
                <SectionHeader kicker="Atelier Favourites" title="Featured Pieces" subline="Our most loved creations" className="mb-12" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product: any, index: number) => (
                        <div key={product.id} className={`animate-fade-in-up animation-delay-${index * 200}`}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
