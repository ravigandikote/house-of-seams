"use client";

import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../../types/product';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div key={product.id} className={`animate-fade-in-up animation-delay-${(index % 4) * 100}`}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
