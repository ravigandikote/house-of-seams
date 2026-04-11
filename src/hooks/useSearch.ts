"use client";

import { useState, useEffect } from 'react';

const useSearch = (products) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);

    useEffect(() => {
        if (searchTerm) {
            const results = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(results);
        } else {
            setFilteredProducts(products);
        }
    }, [searchTerm, products]);

    return {
        searchTerm,
        setSearchTerm,
        filteredProducts,
    };
};

export default useSearch;