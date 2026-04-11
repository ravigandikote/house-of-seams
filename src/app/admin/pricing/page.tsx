'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { Pricing } from '@/types/pricing';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';

const defaultForm = { service: '', priceRange: '', description: '' };

const AdminPricingPage = () => {
    const { items: pricing, isLoading, create, update, remove } = useAdminCrud<Pricing>('pricing');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Pricing | null>(null);
    const [deleteItem, setDeleteItem] = useState<Pricing | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState(defaultForm);

    const openCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        setIsFormOpen(true);
    };

    const openEdit = (item: Pricing) => {
        setEditingItem(item);
        setForm({ service: item.service, priceRange: item.priceRange, description: item.description || '' });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await update(editingItem.id, form);
                showToast('Pricing updated successfully');
            } else {
                await create(form);
                showToast('Pricing created successfully');
            }
            setIsFormOpen(false);
        } catch {
            showToast('Something went wrong', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        try {
            await remove(deleteItem.id);
            showToast('Pricing deleted successfully');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete pricing', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'service', label: 'Service' },
        { key: 'priceRange', label: 'Price Range' },
        { key: 'description', label: 'Description', render: (v: unknown) => {
            const s = String(v ?? '');
            return s.length > 60 ? s.slice(0, 60) + '...' : s;
        }},
    ];

    return (
        <div>
            <AdminPageHeader title="Pricing" subtitle="Manage service pricing" actionLabel="Add Service" onAction={openCreate} />

            <AdminTable
                columns={columns}
                data={pricing}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? 'Edit Pricing' : 'Add Pricing'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={editingItem ? 'Save Changes' : 'Create'}
            >
                <Input
                    label="Service Name"
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    required
                />
                <Input
                    label="Price Range"
                    value={form.priceRange}
                    onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                    placeholder="e.g. $150 - $300"
                    required
                />
                <TextArea
                    label="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                />
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.service || ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminPricingPage;
