"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '../../../services/productService';
import ProductDetail from '../../../components/products/ProductDetail';

const ProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const data = await getProductById(id);
                    setProduct(data);
                } catch (err) {
                    setError('Failed to load product');
                } finally {
                    setLoading(false);
                }
            };

            fetchProduct();
        }
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return <ProductDetail product={product} />;
};

export default ProductPage;