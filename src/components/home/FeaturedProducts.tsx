import React from 'react';
import ProductCard from '../products/ProductCard';

interface FeaturedProductsProps {
    products: any[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
    return (
        <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="font-heading text-3xl font-bold text-center text-charcoal mb-2">Featured Products</h2>
                <p className="text-center text-warm-gray mb-10">Our most loved pieces</p>
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
