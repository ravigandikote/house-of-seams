import { createClient } from '@/lib/supabase/client';
import { toCamelCase } from '@/lib/caseTransform';
import { Blog } from '../types/blog';

const supabase = createClient();

export const fetchBlogs = async (): Promise<Blog[]> => {
    const { data } = await supabase.from('blog_posts').select('*').order('published_date', { ascending: false });
    return (toCamelCase(data || []) as Blog[]);
};

export const fetchBlogBySlug = async (slug: string): Promise<Blog | null> => {
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
    return data ? (toCamelCase(data) as Blog) : null;
};

export const getBlogPostBySlug = fetchBlogBySlug;
