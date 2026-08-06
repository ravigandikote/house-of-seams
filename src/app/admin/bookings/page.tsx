'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { Booking, BookingStatus, BOOKING_STATUSES } from '@/types/booking';
import { VISIT_TYPE_LABELS } from '@/config/appointmentPolicy';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import SelectField from '@/components/ui/SelectField';

const STATUS_COLORS: Record<BookingStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
};

const AdminBookingsPage = () => {
    const { items: bookings, isLoading, error, update, remove } = useAdminCrud<Booking>('bookings');
    const [viewItem, setViewItem] = useState<Booking | null>(null);
    const [status, setStatus] = useState<BookingStatus>('pending');
    const [deleteItem, setDeleteItem] = useState<Booking | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDetails = (booking: Booking) => {
        setViewItem(booking);
        setStatus(booking.status);
    };

    const handleStatusSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewItem) return;
        setIsSubmitting(true);
        try {
            await update(viewItem.id, { status });
            showToast('Booking updated successfully');
            setViewItem(null);
        } catch {
            showToast('Failed to update the booking', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        try {
            await remove(deleteItem.id);
            showToast('Booking deleted');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete the booking', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'customerName', label: 'Name' },
        {
            key: 'email', label: 'Contact', render: (_v: unknown, item: Booking) =>
                item.email || item.phone || '—'
        },
        { key: 'service', label: 'Service', render: (v: unknown) => (v ? String(v) : '—') },
        {
            key: 'visitType', label: 'Visit', render: (v: unknown) =>
                v ? VISIT_TYPE_LABELS[v as keyof typeof VISIT_TYPE_LABELS] ?? String(v) : '—'
        },
        {
            key: 'date', label: 'When', render: (_v: unknown, item: Booking) =>
                item.date ? `${item.date}${item.time ? ` · ${item.time}` : ''}` : '—'
        },
        {
            key: 'requestReference', label: 'Design Ref', render: (v: unknown) =>
                v ? <span className="tracking-widest text-xs">{String(v)}</span> : '—'
        },
        {
            key: 'status', label: 'Status', render: (v: unknown) => {
                const s = String(v ?? '') as BookingStatus;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s] || 'bg-gray-100 text-gray-800'}`}>
                        {s}
                    </span>
                );
            }
        },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Bookings"
                subtitle="Consultation requests — click Edit to view details and update the status"
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">
                    Couldn&apos;t load bookings: {error}. Check that Supabase credentials are configured and
                    migration <code>004_appointments_and_customers.sql</code> has been applied.
                </div>
            )}

            <AdminTable
                columns={columns}
                data={bookings}
                onEdit={openDetails}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title={viewItem ? `Booking from ${viewItem.customerName}` : ''}
                onSubmit={handleStatusSave}
                isSubmitting={isSubmitting}
                submitLabel="Save"
            >
                {viewItem && (
                    <div>
                        <dl className="text-sm space-y-1 mb-4">
                            <div className="flex justify-between border-b border-gray-100 py-1">
                                <dt className="text-gray-500">Contact</dt>
                                <dd className="text-charcoal text-right">
                                    {viewItem.email || '—'}
                                    {viewItem.phone ? ` / ${viewItem.phone}` : ''}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 py-1">
                                <dt className="text-gray-500">Service</dt>
                                <dd className="text-charcoal">{viewItem.service ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 py-1">
                                <dt className="text-gray-500">Visit Type</dt>
                                <dd className="text-charcoal">
                                    {viewItem.visitType
                                        ? VISIT_TYPE_LABELS[viewItem.visitType as keyof typeof VISIT_TYPE_LABELS] ?? viewItem.visitType
                                        : '—'}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 py-1">
                                <dt className="text-gray-500">Date &amp; Time</dt>
                                <dd className="text-charcoal">
                                    {viewItem.date ?? '—'}{viewItem.time ? ` · ${viewItem.time}` : ''}
                                </dd>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 py-1">
                                <dt className="text-gray-500">Policy accepted</dt>
                                <dd className="text-charcoal">
                                    {viewItem.policyAcceptedAt
                                        ? `✓ ${new Date(viewItem.policyAcceptedAt).toLocaleString('en-IN')}`
                                        : '—'}
                                </dd>
                            </div>
                            {viewItem.requestReference && (
                                <div className="flex justify-between border-b border-gray-100 py-1">
                                    <dt className="text-gray-500">Design request</dt>
                                    <dd className="text-charcoal tracking-widest">{viewItem.requestReference}</dd>
                                </div>
                            )}
                            {viewItem.notes && (
                                <div className="py-1">
                                    <dt className="text-gray-500 mb-1">Notes</dt>
                                    <dd className="text-charcoal whitespace-pre-wrap">{viewItem.notes}</dd>
                                </div>
                            )}
                        </dl>
                        <SelectField
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as BookingStatus)}
                            options={BOOKING_STATUSES.map((s) => ({
                                value: s,
                                label: s.charAt(0).toUpperCase() + s.slice(1),
                            }))}
                        />
                    </div>
                )}
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem ? `booking from ${deleteItem.customerName}` : ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminBookingsPage;
