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
import type { Testimonial } from "@/types/testimonial";

const ratingOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

interface TestimonialForm {
  name: string;
  quote: string;
  role: string;
  rating: string;
  date: string;
}

const today = new Date().toISOString().split("T")[0];

const defaultForm: TestimonialForm = {
  name: "",
  quote: "",
  role: "",
  rating: "5",
  date: today,
};

function renderStars(rating: number): string {
  return "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);
}

const columns = [
  { key: "name", label: "Name" },
  {
    key: "quote",
    label: "Quote",
    render: (value: unknown) => {
      const text = typeof value === "string" ? value : "";
      return (
        <span title={text}>
          {text.length > 60 ? text.slice(0, 60) + "..." : text}
        </span>
      );
    },
  },
  { key: "role", label: "Role" },
  {
    key: "rating",
    label: "Rating",
    render: (value: unknown) => {
      const num = typeof value === "number" ? value : 0;
      return <span className="text-yellow-500">{renderStars(num)}</span>;
    },
  },
  { key: "date", label: "Date" },
];

export default function AdminTestimonialsPage() {
  const { items, isLoading, create, update, remove } = useAdminCrud<Testimonial>("testimonials");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteItem, setDeleteItem] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<TestimonialForm>({ ...defaultForm });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...defaultForm, date: new Date().toISOString().split("T")[0] });
    setIsFormOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      quote: item.quote,
      role: item.role,
      rating: String(item.rating),
      date: item.date,
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
      const payload: Partial<Testimonial> = {
        name: form.name,
        quote: form.quote,
        role: form.role,
        rating: parseInt(form.rating, 10),
        date: form.date,
      };

      if (editingItem) {
        await update(editingItem.id, payload);
        showToast("Testimonial updated successfully");
      } else {
        await create(payload);
        showToast("Testimonial created successfully");
      }
      closeForm();
    } catch {
      showToast("Failed to save testimonial", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await remove(deleteItem.id);
      showToast("Testimonial deleted successfully");
      setDeleteItem(null);
    } catch {
      showToast("Failed to delete testimonial", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        subtitle="Manage customer testimonials"
        actionLabel="Add Testimonial"
        onAction={openCreate}
      />

      <AdminTable<Testimonial>
        columns={columns}
        data={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(item) => setDeleteItem(item)}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? "Edit Testimonial" : "Add Testimonial"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <TextArea
          label="Quote"
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          required
        />
        <Input
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          placeholder="e.g. Bride, Mumbai"
        />
        <SelectField
          label="Rating"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          options={ratingOptions}
          placeholder="Select rating"
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
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
