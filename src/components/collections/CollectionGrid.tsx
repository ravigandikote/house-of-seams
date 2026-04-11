import React from 'react';
import CategoryCard from './CategoryCard';
import { Category } from '../../types/category';

interface CollectionGridProps {
  categories: Category[];
}

const CollectionGrid: React.FC<CollectionGridProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <div key={category.id} className={`animate-fade-in-up animation-delay-${(index % 4) * 100}`}>
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid;
