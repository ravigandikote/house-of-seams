"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/product';
import PriceRangeDisplay from './PriceRangeDisplay';
import SizeGuide from './SizeGuide';

const ProductDetail: React.FC = () => {
    const { id } = useParams();
    const { products } = useProducts();
    const product: Product | undefined = products.find((p) => p.id === id);

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <img src={product.imageUrl || product.image} alt={product.name} className="w-full h-auto mb-4" />
            <p className="text-lg mb-4">{product.description}</p>
            <PriceRangeDisplay price={product.price} />
            <SizeGuide sizes={product.sizes} />
            <button className="mt-4 bg-dusty-rose text-white py-2 px-4 rounded">
                Add to Cart
            </button>
        </div>
    );
};

export default ProductDetail;