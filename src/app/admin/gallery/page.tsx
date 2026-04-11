"use client";

import React, { useState } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFormModal from "@/components/admin/AdminFormModal";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { showToast } from "@/components/admin/Toast";
import Input from "@/components/ui/Input";
import SelectField from "@/components/ui/SelectField";
import ImageUploader from "@/components/admin/ImageUploader";
import type { GalleryItem } from "@/types/gallery";

const categoryOptions = [
  { value: "Bridal", label: "Bridal" },
  { value: "Luxury", label: "Luxury" },
  { value: "Custom", label: "Custom" },
  { value: "Jewellery", label: "Jewellery" },
  { value: "Everyday", label: "Everyday" },
  { value: "Occasion", label: "Occasion" },
];

interface GalleryForm {
  url: string;
  alt: string;
  category: string;
}

const defaultForm: GalleryForm = {
  url: "",
  alt: "",
  category: "",
};

export default function AdminGalleryPage() {
  const { items, isLoading, create, update, remove } = useAdminCrud<GalleryItem>("gallery");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<GalleryForm>({ ...defaultForm });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...defaultForm });
    setIsFormOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      url: item.url,
      alt: item.alt,
      category: item.category || "",
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
      const payload: Partial<GalleryItem> = {
        url: form.url,
        alt: form.alt,
        category: form.category || undefined,
      };

      if (editingItem) {
        await update(editingItem.id, payload);
        showToast("Gallery item updated successfully");
      } else {
        await create(payload);
        showToast("Gallery item created successfully");
      }
      closeForm();
    } catch {
      showToast("Failed to save gallery item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await remove(deleteItem.id);
      showToast("Gallery item deleted successfully");
      setDeleteItem(null);
    } catch {
      showToast("Failed to delete gallery item", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Gallery"
        subtitle="Manage your image gallery"
        actionLabel="Add Image"
        onAction={openCreate}
      />

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No gallery items found. Click the button above to add one.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden aspect-square"
            >
              <img
                src={item.url}
                alt={item.alt}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-sm font-medium text-center px-3 mb-3">
                  {item.alt}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="px-3 py-1.5 bg-white text-dusty-rose rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="px-3 py-1.5 bg-white text-red-500 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {item.category && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white bg-opacity-90 text-xs font-medium text-gray-700 rounded-full shadow-sm">
                  {item.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? "Edit Gallery Item" : "Add Gallery Item"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <ImageUploader
          label="Image"
          currentImage={form.url || undefined}
          onUpload={(url) => setForm({ ...form, url })}
        />
        <Input
          label="Alt Text"
          value={form.alt}
          onChange={(e) => setForm({ ...form, alt: e.target.value })}
          required
        />
        <SelectField
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={categoryOptions}
          placeholder="Select a category"
        />
      </AdminFormModal>

      <DeleteConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.alt ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
