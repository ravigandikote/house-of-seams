import React from 'react';
import CategoryCard from '../collections/CategoryCard';

interface CategoriesProps {
    categories: any[];
}

const Categories = ({ categories }: CategoriesProps) => {
    return (
        <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="font-heading text-3xl font-bold text-center text-charcoal mb-2">Explore Our Categories</h2>
                <p className="text-center text-warm-gray mb-10">Discover your perfect style</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category: any, index: number) => (
                        <div key={category.id} className={`animate-fade-in-up animation-delay-${(index % 4) * 100}`}>
                            <CategoryCard category={category} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
