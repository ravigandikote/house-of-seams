// This file contains formatting utility functions.

export const formatCurrency = (amount: number, currency = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};