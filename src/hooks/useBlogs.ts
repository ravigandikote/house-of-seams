"use client";

import { useEffect, useState } from 'react';
import { fetchBlogs } from '../services/blogService';
import { Blog } from '../types/blog';

export const useBlogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                const data = await fetchBlogs();
                setBlogs(data);
            } catch (err) {
                setError('Failed to load blogs');
            } finally {
                setIsLoading(false);
            }
        };

        loadBlogs();
    }, []);

    return { blogs, isLoading, error };
};

export default useBlogs;
