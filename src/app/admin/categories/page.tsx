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
import type { Category } from "@/types/category";

const defaultForm: Partial<Category> = {
  name: "",
  description: "",
  imageUrl: "",
};

const columns = [
  {
    key: "imageUrl",
    label: "Image",
    render: (value: unknown) => {
      const src = typeof value === "string" ? value : "";
      return src ? (
        <img src={src} alt="Category" className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
          No img
        </div>
      );
    },
  },
  { key: "name", label: "Name" },
  {
    key: "description",
    label: "Description",
    render: (value: unknown) => {
      const text = typeof value === "string" ? value : "";
      return <span>{text.length > 80 ? text.slice(0, 80) + "..." : text}</span>;
    },
  },
];

export default function AdminCategoriesPage() {
  const { items, isLoading, create, update, remove } = useAdminCrud<Category>("categories");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<Partial<Category>>({ ...defaultForm });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...defaultForm });
    setIsFormOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl || "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await update(editingItem.id, form);
        showToast("Category updated successfully");
      } else {
        await create(form);
        showToast("Category created successfully");
      }
      closeForm();
    } catch {
      showToast("Failed to save category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await remove(deleteItem.id);
      showToast("Category deleted successfully");
      setDeleteItem(null);
    } catch {
      showToast("Failed to delete category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Manage product categories"
        actionLabel="Add Category"
        onAction={openCreate}
      />

      <AdminTable<Category>
        columns={columns}
        data={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(item) => setDeleteItem(item)}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? "Edit Category" : "Add Category"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <Input
          label="Name"
          value={form.name ?? ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <TextArea
          label="Description"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <ImageUploader
          label="Category Image"
          currentImage={form.imageUrl}
          onUpload={(url) => setForm({ ...form, imageUrl: url, image: url } as Partial<Category>)}
        />
      </AdminFormModal>

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.name ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
