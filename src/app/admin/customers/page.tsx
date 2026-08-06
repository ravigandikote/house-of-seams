'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { Customer } from '@/types/customer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';

// The boutique's customer database. Rows are captured automatically from
// bookings, custom design requests, and newsletter signups (deduped by
// email) — so this page is list + delete only.

const SOURCE_LABELS: Record<string, string> = {
    booking: 'Booking',
    'custom-design': 'Custom Design',
    newsletter: 'Newsletter',
};

const AdminCustomersPage = () => {
    const { items: customers, isLoading, error, remove } = useAdminCrud<Customer>('customers');
    const [deleteItem, setDeleteItem] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        try {
            await remove(deleteItem.id);
            showToast('Customer removed');
            setDeleteItem(null);
        } catch {
            showToast('Failed to remove the customer', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'name', label: 'Name', render: (v: unknown) => (v ? String(v) : '—') },
        { key: 'email', label: 'Email', render: (v: unknown) => (v ? String(v) : '—') },
        { key: 'phone', label: 'Phone', render: (v: unknown) => (v ? String(v) : '—') },
        {
            key: 'source', label: 'First met via', render: (v: unknown) =>
                v ? SOURCE_LABELS[String(v)] ?? String(v) : '—'
        },
        {
            key: 'createdAt', label: 'Since', render: (v: unknown) =>
                v ? new Date(String(v)).toLocaleDateString('en-IN') : '—'
        },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Customers"
                subtitle="Everyone the boutique has met — captured automatically from bookings, custom designs, and newsletter signups"
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">
                    Couldn&apos;t load customers: {error}. Check that Supabase credentials are configured and
                    migration <code>004_appointments_and_customers.sql</code> has been applied.
                </div>
            )}

            <AdminTable
                columns={columns}
                data={customers}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.name || deleteItem?.email || deleteItem?.phone || 'this customer'}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminCustomersPage;
