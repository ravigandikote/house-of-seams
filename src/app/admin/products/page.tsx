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
import SelectField from "@/components/ui/SelectField";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Product } from "@/types/product";

const categoryOptions = [
  { value: "Custom Blouses", label: "Custom Blouses" },
  { value: "Bridal Wear", label: "Bridal Wear" },
  { value: "Luxury Embroidered Pieces", label: "Luxury Embroidered Pieces" },
  { value: "Contemporary Everyday Wear", label: "Contemporary Everyday Wear" },
  { value: "Jewellery", label: "Jewellery" },
  { value: "Alterations", label: "Alterations" },
  { value: "Designer Blouses", label: "Designer Blouses" },
  { value: "Occasion Wear", label: "Occasion Wear" },
];

const defaultForm: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  imageUrl: "",
  isFeatured: false,
};

const columns = [
  {
    key: "imageUrl",
    label: "Image",
    render: (_value: unknown, item: Product) => {
      const src = item.imageUrl || item.image;
      return src ? (
        <img src={src} alt={item.name} className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
          No img
        </div>
      );
    },
  },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  {
    key: "price",
    label: "Price",
    render: (value: unknown) => {
      const num = typeof value === "number" ? value : 0;
      return <span>{"\u20B9"}{num.toLocaleString("en-IN")}</span>;
    },
  },
  {
    key: "isFeatured",
    label: "Featured",
    render: (value: unknown) => (
      <span
        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
          value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    ),
  },
];

export default function AdminProductsPage() {
  const { items, isLoading, create, update, remove } = useAdminCrud<Product>("products");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({ ...defaultForm });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...defaultForm });
    setIsFormOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || "",
      imageUrl: item.imageUrl || "",
      isFeatured: item.isFeatured ?? false,
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
        showToast("Product updated successfully");
      } else {
        await create(form);
        showToast("Product created successfully");
      }
      closeForm();
    } catch {
      showToast("Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await remove(deleteItem.id);
      showToast("Product deleted successfully");
      setDeleteItem(null);
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="Manage your product catalogue"
        actionLabel="Add Product"
        onAction={openCreate}
      />

      <AdminTable<Product>
        columns={columns}
        data={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(item) => setDeleteItem(item)}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? "Edit Product" : "Add Product"}
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
        <Input
          label="Price"
          type="number"
          value={form.price ?? 0}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
          required
        />
        <SelectField
          label="Category"
          value={form.category ?? ""}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={categoryOptions}
          placeholder="Select a category"
        />
        <ToggleSwitch
          label="Featured Product"
          checked={form.isFeatured ?? false}
          onChange={(checked) => setForm({ ...form, isFeatured: checked })}
        />
        <ImageUploader
          label="Product Image"
          currentImage={form.imageUrl || form.image}
          onUpload={(url) => setForm({ ...form, image: url, imageUrl: url })}
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
