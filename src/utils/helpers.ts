// Utility functions for the House of Seams project

// Function to format currency
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Function to capitalize the first letter of a string
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Function to generate a unique ID
export const generateUniqueId = (): string => {
    return 'id-' + Math.random().toString(36).substr(2, 16);
};

// Function to validate an email address
export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Function to debounce a function call
export const debounce = (func: (...args: unknown[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: unknown[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};