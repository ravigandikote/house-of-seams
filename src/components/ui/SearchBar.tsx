"use client";

import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(query);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-sage-green"
            />
            <button
                type="submit"
                className="bg-dusty-rose text-white rounded-r-md p-2 hover:bg-dusty-rose-dark"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;