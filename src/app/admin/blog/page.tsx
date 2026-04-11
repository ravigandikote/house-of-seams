"use client";

import React, { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import AdminFormModal from "@/components/admin/AdminFormModal";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { showToast } from "@/components/admin/Toast";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Blog } from "@/types/blog";

interface BlogForm {
  title: string;
  slug: string;
  content: string;
  author: string;
  publishedDate: string;
  tags: string;
  excerpt: string;
  imageUrl: string;
}

const today = new Date().toISOString().split("T")[0];

const defaultForm: BlogForm = {
  title: "",
  slug: "",
  content: "",
  author: "House of Seams",
  publishedDate: today,
  tags: "",
  excerpt: "",
  imageUrl: "",
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const columns = [
  {
    key: "imageUrl",
    label: "Image",
    render: (value: unknown, item: Blog) => {
      const src = item.imageUrl;
      return src ? (
        <img src={src} alt={item.title} className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
          No img
        </div>
      );
    },
  },
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "publishedDate", label: "Published Date" },
  {
    key: "tags",
    label: "Tags",
    render: (value: unknown) => {
      const tags = Array.isArray(value) ? value : [];
      const joined = tags.join(", ");
      return (
        <span title={joined}>
          {joined.length > 40 ? joined.slice(0, 40) + "..." : joined}
        </span>
      );
    },
  },
];

export default function AdminBlogPage() {
  const { items, isLoading, create, update, remove } = useAdminCrud<Blog>("blog");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Blog | null>(null);
  const [deleteItem, setDeleteItem] = useState<Blog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<BlogForm>({ ...defaultForm });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...defaultForm, publishedDate: new Date().toISOString().split("T")[0] });
    setIsFormOpen(true);
  };

  const openEdit = (item: Blog) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      content: item.content,
      author: item.author,
      publishedDate: item.publishedDate,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      excerpt: item.excerpt,
      imageUrl: item.imageUrl || "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleTitleChange = (value: string) => {
    const updated: Partial<BlogForm> = { title: value };
    if (!editingItem) {
      updated.slug = generateSlug(value);
    }
    setForm({ ...form, ...updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<Blog> = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        author: form.author,
        publishedDate: form.publishedDate,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        excerpt: form.excerpt,
        imageUrl: form.imageUrl || undefined,
      };

      if (editingItem) {
        await update(editingItem.id, payload);
        showToast("Blog post updated successfully");
      } else {
        await create(payload);
        showToast("Blog post created successfully");
      }
      closeForm();
    } catch {
      showToast("Failed to save blog post", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await remove(deleteItem.id);
      showToast("Blog post deleted successfully");
      setDeleteItem(null);
    } catch {
      showToast("Failed to delete blog post", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        subtitle="Manage your blog posts"
        actionLabel="Add Post"
        onAction={openCreate}
      />

      <AdminTable<Blog>
        columns={columns}
        data={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(item) => setDeleteItem(item)}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? "Edit Blog Post" : "Add Blog Post"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <Input
          label="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          required
        />
        <TextArea
          label="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          required
        />
        <TextArea
          label="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          placeholder="Write your blog content here..."
          required
        />
        <Input
          label="Tags"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="comma-separated tags"
        />
        <ImageUploader
          label="Blog Image"
          currentImage={form.imageUrl || undefined}
          onUpload={(url) => setForm({ ...form, imageUrl: url })}
        />
        <Input
          label="Published Date"
          type="date"
          value={form.publishedDate}
          onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
          required
        />
      </AdminFormModal>

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.title ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
