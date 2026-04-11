// This file contains validation utility functions.

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return phoneRegex.test(phone);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 8; // Minimum length of 8 characters
};

export const validateSize = (size: string, validSizes: string[]): boolean => {
    return validSizes.includes(size);
};