"use client";

import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/productService';
import { adminService } from '../services/adminService';
import { Product } from '../types/product';

const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    return { products, loading, error };
};

export const useCategories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await adminService.fetchCategories();
                setCategories(data);
            } catch (err) {
                setError('Failed to load categories');
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, []);

    return { categories, isLoading, error };
};

export { useProducts };
export default useProducts;