import React from 'react';
import CategoryCard from '../collections/CategoryCard';
import { SectionHeader } from '../ui/decor';

interface CategoriesProps {
    categories: any[];
}

const Categories = ({ categories }: CategoriesProps) => {
    return (
        <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
                <SectionHeader kicker="The Wardrobe" title="Explore Our Categories" subline="Discover your perfect style" className="mb-12" />
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
