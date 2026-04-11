"use client";

import React from "react";
import Link from "next/link";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { Blog } from "@/types/blog";
import type { GalleryItem } from "@/types/gallery";
import type { Testimonial } from "@/types/testimonial";

const statSections = [
  {
    key: "products",
    label: "Products",
    href: "/admin/products",
    color: "bg-dusty-rose/10 text-dusty-rose",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    key: "categories",
    label: "Categories",
    href: "/admin/categories",
    color: "bg-blue-50 text-blue-600",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: "gallery",
    label: "Gallery",
    href: "/admin/media",
    color: "bg-purple-50 text-purple-600",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "blog",
    label: "Blog Posts",
    href: "/admin/blog",
    color: "bg-amber-50 text-amber-600",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    key: "testimonials",
    label: "Testimonials",
    href: "/admin/testimonials",
    color: "bg-green-50 text-green-600",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

const quickActions = [
  { label: "Add New Product", href: "/admin/products" },
  { label: "Add New Category", href: "/admin/categories" },
  { label: "Add Blog Post", href: "/admin/blog" },
  { label: "Manage Gallery", href: "/admin/media" },
];

export default function AdminDashboardPage() {
  const { items: products, isLoading: loadingProducts } = useAdminCrud<Product>("products");
  const { items: categories, isLoading: loadingCategories } = useAdminCrud<Category>("categories");
  const { items: gallery, isLoading: loadingGallery } = useAdminCrud<GalleryItem>("gallery");
  const { items: blogs, isLoading: loadingBlogs } = useAdminCrud<Blog>("blog");
  const { items: testimonials, isLoading: loadingTestimonials } = useAdminCrud<Testimonial>("testimonials");

  const counts: Record<string, number | null> = {
    products: loadingProducts ? null : products.length,
    categories: loadingCategories ? null : categories.length,
    gallery: loadingGallery ? null : gallery.length,
    blog: loadingBlogs ? null : blogs.length,
    testimonials: loadingTestimonials ? null : testimonials.length,
  };

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Overview of your store" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statSections.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${section.color}`}>{section.icon}</div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{section.label}</p>
            <p className="text-2xl font-bold text-charcoal">
              {counts[section.key] === null ? (
                <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse" />
              ) : (
                counts[section.key]
              )}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-heading text-lg font-bold text-charcoal mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-dusty-rose/5 hover:border-dusty-rose hover:text-dusty-rose transition-colors"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
