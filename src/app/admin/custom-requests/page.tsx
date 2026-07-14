'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import {
    CustomDesignRequest,
    RequestStatus,
    REQUEST_STATUSES,
} from '@/types/customDesignRequest';
import { MEASUREMENT_FIELDS, MEASUREMENT_LABELS } from '@/types/measurements';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import { showToast } from '@/components/admin/Toast';
import SelectField from '@/components/ui/SelectField';
import BlousePreview from '@/components/customizer/BlousePreview';

const STATUS_COLORS: Record<RequestStatus, string> = {
    submitted: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    quoted: 'bg-purple-100 text-purple-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const AdminCustomRequestsPage = () => {
    const { items: requests, isLoading, error, update } = useAdminCrud<CustomDesignRequest>('custom-requests');
    const [viewItem, setViewItem] = useState<CustomDesignRequest | null>(null);
    const [status, setStatus] = useState<RequestStatus>('submitted');
    const [previewView, setPreviewView] = useState<'front' | 'back'>('front');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openDetails = (request: CustomDesignRequest) => {
        setViewItem(request);
        setStatus(request.status);
        setPreviewView('front');
    };

    const handleStatusSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewItem) return;
        setIsSubmitting(true);
        try {
            await update(viewItem.id, { status });
            showToast('Status updated successfully');
            setViewItem(null);
        } catch {
            showToast('Failed to update status', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { key: 'customerName', label: 'Customer' },
        {
            key: 'customerEmail', label: 'Contact', render: (_v: unknown, item: CustomDesignRequest) =>
                item.customerEmail || item.customerPhone || '—'
        },
        {
            key: 'designSnapshot', label: 'Design', render: (v: unknown) =>
                (v as CustomDesignRequest['designSnapshot'])?.name ?? '—'
        },
        { key: 'customerAge', label: 'Age', render: (v: unknown) => (v == null ? '—' : String(v)) },
        {
            key: 'createdAt', label: 'Date', render: (v: unknown) =>
                v ? new Date(String(v)).toLocaleDateString('en-IN') : '—'
        },
        {
            key: 'status', label: 'Status', render: (v: unknown) => {
                const s = String(v ?? '') as RequestStatus;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s] || 'bg-gray-100 text-gray-800'}`}>
                        {s}
                    </span>
                );
            }
        },
    ];

    // The customer's chosen colour overrides the design's base colour.
    const previewDesign = viewItem
        ? { ...viewItem.designSnapshot, baseColor: viewItem.selectedColor || viewItem.designSnapshot.baseColor }
        : null;

    return (
        <div>
            <AdminPageHeader
                title="Custom Requests"
                subtitle="Customer blouse customizations awaiting a quote — click Edit to view details and update the status"
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">
                    Couldn&apos;t load requests: {error}. Check that Supabase credentials are configured and
                    migration <code>002_blouse_customizer.sql</code> has been applied.
                </div>
            )}

            <AdminTable
                columns={columns}
                data={requests}
                onEdit={openDetails}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title={viewItem ? `Request from ${viewItem.customerName}` : ''}
                onSubmit={handleStatusSave}
                isSubmitting={isSubmitting}
                submitLabel="Save Status"
            >
                {viewItem && previewDesign && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="block text-sm font-medium text-gray-700">
                                    {viewItem.designSnapshot.name}
                                </span>
                                <div className="flex gap-1">
                                    {(['front', 'back'] as const).map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setPreviewView(v)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${previewView === v
                                                ? 'bg-dusty-rose text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {v === 'front' ? 'Front' : 'Back'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-cream rounded-lg p-4">
                                <BlousePreview
                                    design={previewDesign}
                                    measurements={viewItem.measurements}
                                    view={previewView}
                                />
                            </div>
                        </div>
                        <div>
                            <dl className="text-sm space-y-1 mb-4">
                                <div className="flex justify-between border-b border-gray-100 py-1">
                                    <dt className="text-gray-500">Contact</dt>
                                    <dd className="text-charcoal text-right">
                                        {viewItem.customerEmail || '—'}
                                        {viewItem.customerPhone ? ` / ${viewItem.customerPhone}` : ''}
                                    </dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 py-1">
                                    <dt className="text-gray-500">Age</dt>
                                    <dd className="text-charcoal">{viewItem.customerAge ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 py-1">
                                    <dt className="text-gray-500">Color</dt>
                                    <dd className="flex items-center gap-2">
                                        <span
                                            className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: previewDesign.baseColor }}
                                        />
                                        {previewDesign.baseColor}
                                    </dd>
                                </div>
                                {MEASUREMENT_FIELDS.map((field) => (
                                    <div key={field} className="flex justify-between border-b border-gray-100 py-1">
                                        <dt className="text-gray-500">{MEASUREMENT_LABELS[field]}</dt>
                                        <dd className="text-charcoal">{viewItem.measurements[field]}&Prime;</dd>
                                    </div>
                                ))}
                                {viewItem.notes && (
                                    <div className="py-1">
                                        <dt className="text-gray-500 mb-1">Notes</dt>
                                        <dd className="text-charcoal">{viewItem.notes}</dd>
                                    </div>
                                )}
                                {viewItem.linkedBookingId && (
                                    <div className="py-1">
                                        <Link href="/admin/bookings" className="text-dusty-rose hover:underline text-sm">
                                            View linked booking →
                                        </Link>
                                    </div>
                                )}
                            </dl>
                            <SelectField
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                                options={REQUEST_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                            />
                        </div>
                    </div>
                )}
            </AdminFormModal>
        </div>
    );
};

export default AdminCustomRequestsPage;
