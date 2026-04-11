import React from 'react';
import { Category } from '../../types/category';

interface CategoryCardProps {
    category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    return (
        <div className="group bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="overflow-hidden">
                <img
                    src={category.imageUrl || (category as any).image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-charcoal group-hover:text-dusty-rose transition-colors duration-200">{category.name}</h3>
                <p className="text-warm-gray text-sm mt-1">{category.description}</p>
            </div>
        </div>
    );
};

export default CategoryCard;
