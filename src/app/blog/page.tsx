import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import BlogCard from '../../components/blog/BlogCard';

const BlogPage = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('blog_posts').select('*').order('published_date', { ascending: false });
    const blogs = toCamelCase(data || []) as any[];

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal">Blog</h1>
            <p className="text-center text-warm-gray mb-10">Stories, tips, and insights</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog: any) => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
