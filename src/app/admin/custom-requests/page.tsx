'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import {
    AdminRequestUpdate,
    CustomDesignRequest,
    RequestStatus,
    REQUEST_STATUSES,
    STATUS_LABELS,
    SketchAnnotation,
} from '@/types/customDesignRequest';
import SketchAnnotator from '@/components/admin/SketchAnnotator';
import { MEASUREMENT_GROUPS, MEASUREMENT_LABELS } from '@/types/measurements';
import { LEHENGA_MEASUREMENT_SPEC } from '@/types/lehengaMeasurements';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import { showToast } from '@/components/admin/Toast';
import SelectField from '@/components/ui/SelectField';
import TextArea from '@/components/ui/TextArea';

const STATUS_COLORS: Record<RequestStatus, string> = {
    submitted: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    quoted: 'bg-purple-100 text-purple-800',
    confirmed: 'bg-green-100 text-green-800',
    in_stitching: 'bg-indigo-100 text-indigo-800',
    ready: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

const AdminCustomRequestsPage = () => {
    const { items: requests, isLoading, error, update } = useAdminCrud<CustomDesignRequest>('custom-requests');
    const [viewItem, setViewItem] = useState<CustomDesignRequest | null>(null);
    const [status, setStatus] = useState<RequestStatus>('submitted');
    // Optional client-visible message written onto the status event; it
    // appears on the customer's Design Story page under the new chapter.
    const [statusNote, setStatusNote] = useState('');
    const [designerNote, setDesignerNote] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [previewView, setPreviewView] = useState<'front' | 'back'>('front');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Kavya's sketch pins — edited in the modal, saved with the request.
    const [annotations, setAnnotations] = useState<SketchAnnotation[]>([]);
    // Muse Board images arrive as fresh signed URLs from the admin API.
    const [muse, setMuse] = useState<{ urls: string[]; occasionNote: string | null } | null>(null);

    const openDetails = (request: CustomDesignRequest) => {
        setViewItem(request);
        setStatus(request.status);
        setStatusNote('');
        setDesignerNote(request.designerNote ?? '');
        setLinkCopied(false);
        setPreviewView('front');
        setAnnotations(request.annotations ?? []);
        setMuse(null);
        if (request.museBoard?.imagePaths?.length || request.museBoard?.occasionNote) {
            fetch(`/api/admin/custom-requests/${request.id}/muse`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => data && setMuse(data))
                .catch(() => {});
        }
    };

    // Full URL so Kavya can paste it straight into WhatsApp. The modal only
    // renders after user interaction, so window is available.
    const atelierUrl = viewItem?.atelierToken
        ? `${window.location.origin}/atelier/${viewItem.atelierToken}`
        : null;

    const handleCopyLink = async () => {
        if (!atelierUrl) return;
        try {
            await navigator.clipboard.writeText(atelierUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            window.prompt('Copy the Design Story link:', atelierUrl);
        }
    };

    const handleStatusSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewItem) return;
        setIsSubmitting(true);
        try {
            const payload: Partial<CustomDesignRequest> & AdminRequestUpdate = {
                status,
                statusNote: statusNote.trim() || undefined,
                designerNote: designerNote.trim() || null,
                // Unsaved (empty-note) pins are dropped, not persisted.
                annotations: annotations.filter((a) => a.note.trim()),
            };
            await update(viewItem.id, payload);
            showToast('Request updated successfully');
            setViewItem(null);
        } catch {
            showToast('Failed to update the request', 'error');
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
            key: 'category', label: 'Category', render: (v: unknown) => {
                const c = String(v || 'blouse');
                return c.charAt(0).toUpperCase() + c.slice(1);
            }
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
    const viewCategory = viewItem?.category ?? 'blouse';
    const isLehengaItem = viewCategory === 'lehenga';

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
                submitLabel="Save"
            >
                {viewItem && previewDesign && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="block text-sm font-medium text-gray-700">
                                    {viewItem.designSnapshot.name}
                                </span>
                                {!isLehengaItem && (
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
                                )}
                            </div>
                            <div className="bg-cream rounded-lg p-4">
                                <SketchAnnotator
                                    category={viewCategory}
                                    design={previewDesign}
                                    measurements={viewItem.measurements}
                                    view={isLehengaItem ? 'front' : previewView}
                                    annotations={annotations}
                                    onChange={setAnnotations}
                                />
                            </div>
                            {muse && (muse.urls.length > 0 || muse.occasionNote) && (
                                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <span className="block text-xs font-medium text-gray-500 mb-2">
                                        Customer&apos;s Muse Board
                                    </span>
                                    {muse.urls.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mb-2">
                                            {muse.urls.map((src, i) => (
                                                <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={src}
                                                        alt={`Inspiration ${i + 1}`}
                                                        className="w-16 h-16 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {muse.occasionNote && (
                                        <p className="text-xs text-charcoal italic">&ldquo;{muse.occasionNote}&rdquo;</p>
                                    )}
                                </div>
                            )}
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
                                {viewItem.preferences && (
                                    <>
                                        <div className="flex justify-between border-b border-gray-100 py-1">
                                            <dt className="text-gray-500">Opening / Fit / Seams</dt>
                                            <dd className="text-charcoal text-right capitalize">
                                                {viewItem.preferences.blouseOpening} · {viewItem.preferences.fitPreference} ·{' '}
                                                {viewItem.preferences.seamAllowance}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 py-1">
                                            <dt className="text-gray-500">Cup Padding / Inner-wear</dt>
                                            <dd className="text-charcoal text-right">
                                                {viewItem.preferences.cupPadding ? 'Yes' : 'No'}
                                                {viewItem.preferences.braSize ? ` · ${viewItem.preferences.braSize}` : ''}
                                            </dd>
                                        </div>
                                    </>
                                )}
                                {isLehengaItem
                                    ? LEHENGA_MEASUREMENT_SPEC.fields
                                          .filter((f) => typeof (viewItem.measurements as Record<string, number>)[f.key] === 'number')
                                          .map((f) => (
                                              <div key={f.key} className="flex justify-between border-b border-gray-100 py-1">
                                                  <dt className="text-gray-500">{f.label}</dt>
                                                  <dd className="text-charcoal">
                                                      {(viewItem.measurements as Record<string, number>)[f.key]}
                                                      {f.unit === 'in' ? '″' : ''}
                                                  </dd>
                                              </div>
                                          ))
                                    : MEASUREMENT_GROUPS.map((group) => {
                                          // Older requests may predate some fields — show only what was submitted.
                                          const present = group.fields.filter(
                                              (f) => typeof viewItem.measurements[f] === 'number'
                                          );
                                          if (present.length === 0) return null;
                                          return (
                                              <React.Fragment key={group.id}>
                                                  <div className="pt-1">
                                                      <dt className="font-heading text-xs font-bold text-charcoal uppercase tracking-wide">
                                                          {group.label}
                                                      </dt>
                                                  </div>
                                                  {present.map((field) => (
                                                      <div key={field} className="flex justify-between border-b border-gray-100 py-1">
                                                          <dt className="text-gray-500">{MEASUREMENT_LABELS[field]}</dt>
                                                          <dd className="text-charcoal">{viewItem.measurements[field]}&Prime;</dd>
                                                      </div>
                                                  ))}
                                              </React.Fragment>
                                          );
                                      })}
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
                            {atelierUrl && (
                                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <span className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Design Story page (share with the customer on WhatsApp)
                                    </span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={atelierUrl}
                                            onFocus={(e) => e.target.select()}
                                            className="flex-1 min-w-0 text-xs text-gray-600 bg-white border border-gray-200 rounded px-2 py-1.5"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded bg-dusty-rose text-white hover:bg-dusty-rose-dark transition-colors"
                                        >
                                            {linkCopied ? 'Copied ✓' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <SelectField
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                                options={REQUEST_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
                            />
                            {status !== viewItem.status && (
                                <TextArea
                                    label="Message to the customer (optional)"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    rows={2}
                                    placeholder="Shown on their Design Story page with this status change…"
                                />
                            )}
                            <TextArea
                                label="Designer's note (shown at the top of their Design Story)"
                                value={designerNote}
                                onChange={(e) => setDesignerNote(e.target.value)}
                                rows={2}
                                placeholder="e.g. The sweetheart neckline will sit beautifully with this sleeve…"
                            />
                        </div>
                    </div>
                )}
            </AdminFormModal>
        </div>
    );
};

export default AdminCustomRequestsPage;
