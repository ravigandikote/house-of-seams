"use client";

import React from 'react';
import { Product } from '../../types/product';
import { Button } from '../ui/Button';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="group bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="overflow-hidden">
                <img
                    src={product.imageUrl || product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-charcoal">{product.name}</h3>
                <p className="text-warm-gray text-sm mt-1 line-clamp-2">{product.description}</p>
                <p className="text-xl font-bold text-dusty-rose mt-2">{`\u20B9${product.price}`}</p>
                <div className="mt-3">
                    <Button onClick={() => console.log(`Added ${product.name} to cart`)}>Add to Cart</Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
