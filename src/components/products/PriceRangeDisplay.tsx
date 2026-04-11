import React from 'react';

const PriceRangeDisplay = ({ minPrice, maxPrice }) => {
    return (
        <div className="price-range-display">
            <h3 className="text-lg font-semibold">Price Range</h3>
            <p className="text-gray-700">
                Starting from <span className="font-bold">${minPrice}</span> to <span className="font-bold">${maxPrice}</span>
            </p>
        </div>
    );
};

export default PriceRangeDisplay;