"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Blog } from '../../types/blog';
import { getBlogPostBySlug } from '../../services/blogService';

const BlogPost: React.FC = () => {
    const { slug } = useParams();

    const [post, setPost] = React.useState<Blog | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (slug) {
            getBlogPostBySlug(slug as string)
                .then((data) => {
                    setPost(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Failed to load the blog post.');
                    setLoading(false);
                });
        }
    }, [slug]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!post) return <div>Blog post not found.</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
            )}
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="text-gray-600 mb-4">
                {post.author} &middot; {post.publishedDate}
            </div>
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
                    ))}
                </div>
            )}
            <div className="prose max-w-none whitespace-pre-line">{post.content}</div>
        </div>
    );
};

export default BlogPost;