import React from 'react';
import { GoldDivider } from '../../components/ui/decor';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import BlogCard from '../../components/blog/BlogCard';
import blogJson from '@/data/blog.json';

const BlogPage = async () => {
    const supabase = createClient();
    let blogs: any[] = [];

    if (supabase) {
        const { data } = await supabase.from('blog_posts').select('*').order('published_date', { ascending: false });
        blogs = toCamelCase(data || []) as any[];
    } else {
        blogs = blogJson as any[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Journal</p>
            <h1 className="font-heading text-display-lg text-center mb-3 text-ink">Blog</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">Stories, tips, and insights</p>
            <GoldDivider className="mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog: any) => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
