import React from 'react';

const ProductFilter = ({ categories, onFilterChange }) => {
    const handleCategoryChange = (event) => {
        onFilterChange(event.target.value);
    };

    return (
        <div className="flex flex-col mb-4">
            <label htmlFor="category" className="mb-2 text-lg font-semibold">
                Filter by Category
            </label>
            <select
                id="category"
                onChange={handleCategoryChange}
                className="p-2 border border-gray-300 rounded"
            >
                <option value="">All Categories</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ProductFilter;