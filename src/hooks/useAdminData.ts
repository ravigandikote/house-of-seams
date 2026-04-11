"use client";

import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Booking } from '../types/booking';

export const useAdminData = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const [productsData, categoriesData, bookingsData] = await Promise.all([
                    adminService.fetchProducts(),
                    adminService.fetchCategories(),
                    adminService.fetchBookings(),
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
                setBookings(bookingsData);
            } catch (err) {
                setError('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, []);

    return { products, categories, bookings, loading, error };
};

export default useAdminData;
