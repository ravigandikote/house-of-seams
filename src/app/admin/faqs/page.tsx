'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { FAQ } from '@/types/faq';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';

const defaultForm = { question: '', answer: '' };

const AdminFAQsPage = () => {
    const { items: faqs, isLoading, create, update, remove } = useAdminCrud<FAQ>('faqs');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQ | null>(null);
    const [deleteItem, setDeleteItem] = useState<FAQ | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState(defaultForm);

    const openCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        setIsFormOpen(true);
    };

    const openEdit = (faq: FAQ) => {
        setEditingItem(faq);
        setForm({ question: faq.question, answer: faq.answer });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await update(editingItem.id, form);
                showToast('FAQ updated successfully');
            } else {
                await create(form);
                showToast('FAQ created successfully');
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
            showToast('FAQ deleted successfully');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete FAQ', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        {
            key: 'question', label: 'Question', render: (v: unknown) => {
                const s = String(v ?? '');
                return s.length > 60 ? s.slice(0, 60) + '...' : s;
            }
        },
        {
            key: 'answer', label: 'Answer', render: (v: unknown) => {
                const s = String(v ?? '');
                return s.length > 80 ? s.slice(0, 80) + '...' : s;
            }
        },
    ];

    return (
        <div>
            <AdminPageHeader title="FAQs" subtitle="Manage frequently asked questions" actionLabel="Add FAQ" onAction={openCreate} />

            <AdminTable
                columns={columns}
                data={faqs}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? 'Edit FAQ' : 'Add FAQ'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={editingItem ? 'Save Changes' : 'Create'}
            >
                <Input
                    label="Question"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    required
                />
                <TextArea
                    label="Answer"
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    rows={5}
                    required
                />
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.question || ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminFAQsPage;
