import React from 'react';
import { Blog } from '../../types/blog';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{blog.title}</h3>
        <p className="text-gray-600">{blog.excerpt}</p>
        <a href={`/blog/${blog.slug}`} className="text-blue-500 hover:underline">
          Read More
        </a>
      </div>
    </div>
  );
};

export default BlogCard;