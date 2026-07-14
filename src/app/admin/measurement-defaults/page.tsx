'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import {
    MeasurementDefault,
    MEASUREMENT_FIELDS,
    MEASUREMENT_LABELS,
} from '@/types/measurements';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import Input from '@/components/ui/Input';

type DefaultsForm = Omit<MeasurementDefault, 'id' | 'createdAt' | 'updatedAt'>;

const defaultForm: DefaultsForm = {
    label: '',
    ageMin: 18,
    ageMax: 25,
    bust: 34,
    waist: 28,
    shoulderWidth: 14,
    blouseLength: 14,
    sleeveLength: 6,
    armhole: 15.5,
    frontNeckDepth: 6.5,
    backNeckDepth: 7,
};

const AdminMeasurementDefaultsPage = () => {
    const { items: brackets, isLoading, create, update, remove } =
        useAdminCrud<MeasurementDefault>('measurement-defaults');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MeasurementDefault | null>(null);
    const [deleteItem, setDeleteItem] = useState<MeasurementDefault | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState<DefaultsForm>(defaultForm);

    const openCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        setIsFormOpen(true);
    };

    const openEdit = (bracket: MeasurementDefault) => {
        setEditingItem(bracket);
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = bracket;
        setForm(rest);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.ageMin > form.ageMax) {
            showToast('Age From must not be greater than Age To', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await update(editingItem.id, form);
                showToast('Bracket updated successfully');
            } else {
                await create(form);
                showToast('Bracket created successfully');
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
            showToast('Bracket deleted successfully');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete bracket', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'label', label: 'Bracket' },
        {
            key: 'ageMin', label: 'Ages', render: (_v: unknown, item: MeasurementDefault) =>
                `${item.ageMin}–${item.ageMax}`
        },
        { key: 'bust', label: 'Bust (in)' },
        { key: 'waist', label: 'Waist (in)' },
        { key: 'shoulderWidth', label: 'Shoulder (in)' },
        { key: 'blouseLength', label: 'Length (in)' },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Measurement Defaults"
                subtitle="Age-bracket starting measurements used to pre-fill the customizer (customers can edit everything)"
                actionLabel="Add Bracket"
                onAction={openCreate}
            />

            <AdminTable
                columns={columns}
                data={brackets}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? 'Edit Bracket' : 'Add Bracket'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={editingItem ? 'Save Changes' : 'Create'}
            >
                <Input
                    label="Label (e.g. 18–25)"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                />
                <div className="grid grid-cols-2 gap-x-4">
                    <Input
                        label="Age From"
                        type="number"
                        min={1}
                        max={120}
                        value={form.ageMin}
                        onChange={(e) => setForm({ ...form, ageMin: Number(e.target.value) })}
                        required
                    />
                    <Input
                        label="Age To"
                        type="number"
                        min={1}
                        max={120}
                        value={form.ageMax}
                        onChange={(e) => setForm({ ...form, ageMax: Number(e.target.value) })}
                        required
                    />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                    Default measurements in inches — rough starting points only; customers can edit every value.
                </p>
                <div className="grid grid-cols-2 gap-x-4">
                    {MEASUREMENT_FIELDS.map((field) => (
                        <Input
                            key={field}
                            label={`${MEASUREMENT_LABELS[field]} (in)`}
                            type="number"
                            step={0.5}
                            min={0}
                            value={form[field]}
                            onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                            required
                        />
                    ))}
                </div>
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.label || ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminMeasurementDefaultsPage;
