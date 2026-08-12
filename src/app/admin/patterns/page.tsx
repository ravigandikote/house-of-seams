'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import {
    DIFFICULTY_LABELS,
    PATTERN_CATEGORIES,
    PATTERN_DIFFICULTIES,
    PatternProfile,
} from '@/types/pattern';
import { renderGarment } from '@/components/customizer/rendererRegistry';
import { categoryById, RendererId } from '@/types/customizerCategories';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import SelectField from '@/components/ui/SelectField';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

// Pattern profiles — OUR presentation of purchasable sewing patterns.
// Kavya prices/uploads the files in Shopify; the shopify_handle here must
// match the Shopify product handle exactly (the site joins on it).

const RENDERERS: RendererId[] = ['blouse', 'lehenga', 'kurti', 'bottoms'];

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

interface PatternForm {
    shopifyHandle: string;
    title: string;
    category: string;
    patternType: string;
    difficulty: string;
    sizeRange: string;
    a4: boolean;
    a0: boolean;
    projector: boolean;
    fabricNotes: string;
    whatsIncluded: string;
    renderer: RendererId;
    styleAttributes: Record<string, string>;
    relatedDesignSlugs: string;
    sortOrder: string;
    isActive: boolean;
}

function defaultStyle(renderer: RendererId): Record<string, string> {
    const style: Record<string, string> = { baseColor: '#D6A6B1' };
    for (const [key, allowed] of Object.entries(categoryById(renderer)?.styleEnums ?? {})) {
        style[key] = allowed[0];
    }
    return style;
}

const emptyForm: PatternForm = {
    shopifyHandle: '',
    title: '',
    category: 'blouse',
    patternType: '',
    difficulty: 'intermediate',
    sizeRange: '',
    a4: true,
    a0: true,
    projector: false,
    fabricNotes: '',
    whatsIncluded: 'Layered PDF pattern\nStep-by-step instructions',
    renderer: 'blouse',
    styleAttributes: defaultStyle('blouse'),
    relatedDesignSlugs: '',
    sortOrder: '0',
    isActive: true,
};

const AdminPatternsPage = () => {
    const { items: patterns, isLoading, error, create, update, remove } =
        useAdminCrud<PatternProfile>('pattern-profiles');
    const [editItem, setEditItem] = useState<PatternProfile | null>(null);
    const [form, setForm] = useState<PatternForm | null>(null);
    const [deleteItem, setDeleteItem] = useState<PatternProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openCreate = () => {
        setEditItem(null);
        setForm({ ...emptyForm, styleAttributes: defaultStyle('blouse') });
    };

    const openEdit = (p: PatternProfile) => {
        setEditItem(p);
        setForm({
            shopifyHandle: p.shopifyHandle,
            title: p.title,
            category: p.category,
            patternType: p.patternType,
            difficulty: p.difficulty,
            sizeRange: p.sizeRange,
            a4: p.formats.a4,
            a0: p.formats.a0,
            projector: p.formats.projector,
            fabricNotes: p.fabricNotes ?? '',
            whatsIncluded: (p.whatsIncluded ?? []).join('\n'),
            renderer: p.previewConfig.renderer,
            styleAttributes: { ...defaultStyle(p.previewConfig.renderer), ...p.previewConfig.style },
            relatedDesignSlugs: (p.relatedDesignSlugs ?? []).join(', '),
            sortOrder: String(p.sortOrder ?? 0),
            isActive: p.isActive,
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        setIsSubmitting(true);
        try {
            const payload: Partial<PatternProfile> = {
                shopifyHandle: form.shopifyHandle.trim(),
                title: form.title,
                category: form.category as PatternProfile['category'],
                patternType: form.patternType,
                difficulty: form.difficulty as PatternProfile['difficulty'],
                sizeRange: form.sizeRange,
                formats: { a4: form.a4, a0: form.a0, projector: form.projector },
                fabricNotes: form.fabricNotes || null,
                whatsIncluded: form.whatsIncluded.split('\n').map((s) => s.trim()).filter(Boolean),
                previewConfig: { renderer: form.renderer, style: form.styleAttributes },
                relatedDesignSlugs: form.relatedDesignSlugs.split(',').map((s) => s.trim()).filter(Boolean),
                sortOrder: Number(form.sortOrder) || 0,
                isActive: form.isActive,
            };
            if (editItem) {
                await update(editItem.id, payload);
                showToast('Pattern updated');
            } else {
                await create(payload);
                showToast('Pattern created');
            }
            setForm(null);
            setEditItem(null);
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to save the pattern', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        try {
            await remove(deleteItem.id);
            showToast('Pattern deleted');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete the pattern', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'title', label: 'Pattern' },
        { key: 'category', label: 'Category', render: (v: unknown) => labelize(String(v ?? '')) },
        { key: 'shopifyHandle', label: 'Shopify Handle', render: (v: unknown) => <code className="text-xs">{String(v ?? '')}</code> },
        { key: 'difficulty', label: 'Difficulty', render: (v: unknown) => labelize(String(v ?? '')) },
        { key: 'sortOrder', label: 'Order' },
        {
            key: 'isActive', label: 'Active', render: (v: unknown) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {v ? 'Active' : 'Hidden'}
                </span>
            )
        },
    ];

    const rendererEnums = form ? categoryById(form.renderer)?.styleEnums ?? {} : {};

    return (
        <div>
            <AdminPageHeader
                title="Patterns"
                subtitle="Sewing-pattern profiles — the handle must match the Shopify product exactly; price and files live in Shopify"
                actionLabel="Add Pattern"
                onAction={openCreate}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">
                    Couldn&apos;t load patterns: {error}. Check that migration{' '}
                    <code>011_pattern_profiles.sql</code> has been applied.
                </div>
            )}

            <AdminTable
                columns={columns}
                data={patterns}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={!!form}
                onClose={() => { setForm(null); setEditItem(null); }}
                title={editItem ? `Edit ${editItem.title}` : 'New pattern'}
                onSubmit={handleSave}
                isSubmitting={isSubmitting}
                submitLabel={editItem ? 'Save' : 'Create'}
            >
                {form && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div>
                            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            <Input
                                label="Shopify handle (must match the product in Shopify)"
                                value={form.shopifyHandle}
                                onChange={(e) => setForm({ ...form, shopifyHandle: e.target.value })}
                                placeholder="princess-cut-blouse-pattern"
                            />
                            <div className="grid grid-cols-2 gap-x-4">
                                <SelectField
                                    label="Category"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    options={PATTERN_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
                                />
                                <SelectField
                                    label="Difficulty"
                                    value={form.difficulty}
                                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                                    options={PATTERN_DIFFICULTIES.map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4">
                                <Input label="Pattern type" value={form.patternType} onChange={(e) => setForm({ ...form, patternType: e.target.value })} placeholder="princess_cut" />
                                <Input label="Size range" value={form.sizeRange} onChange={(e) => setForm({ ...form, sizeRange: e.target.value })} placeholder="32–44 bust" />
                            </div>
                            <div className="flex gap-5 mb-4">
                                <ToggleSwitch label="A4" checked={form.a4} onChange={(v) => setForm({ ...form, a4: v })} />
                                <ToggleSwitch label="A0" checked={form.a0} onChange={(v) => setForm({ ...form, a0: v })} />
                                <ToggleSwitch label="Projector" checked={form.projector} onChange={(v) => setForm({ ...form, projector: v })} />
                            </div>
                            <TextArea
                                label="What's included (one line per item)"
                                value={form.whatsIncluded}
                                onChange={(e) => setForm({ ...form, whatsIncluded: e.target.value })}
                                rows={3}
                            />
                            <TextArea
                                label="Fabric notes"
                                value={form.fabricNotes}
                                onChange={(e) => setForm({ ...form, fabricNotes: e.target.value })}
                                rows={2}
                            />
                            <Input
                                label="Related design slugs (comma-separated)"
                                value={form.relatedDesignSlugs}
                                onChange={(e) => setForm({ ...form, relatedDesignSlugs: e.target.value })}
                                placeholder="classic-round, elegant-sweetheart"
                            />
                            <div className="grid grid-cols-2 gap-x-4 items-end">
                                <Input label="Sort order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                                <div className="pb-4">
                                    <ToggleSwitch label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <SelectField
                                label="Preview renderer"
                                value={form.renderer}
                                onChange={(e) => {
                                    const renderer = e.target.value as RendererId;
                                    setForm({ ...form, renderer, styleAttributes: defaultStyle(renderer) });
                                }}
                                options={RENDERERS.map((r) => ({ value: r, label: labelize(r) }))}
                            />
                            {Object.entries(rendererEnums).map(([key, allowed]) => (
                                <SelectField
                                    key={key}
                                    label={labelize(key)}
                                    value={form.styleAttributes[key] ?? allowed[0]}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            styleAttributes: { ...form.styleAttributes, [key]: e.target.value },
                                        })
                                    }
                                    options={allowed.map((o) => ({ value: o, label: labelize(o) }))}
                                />
                            ))}
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Sketch colour
                                <input
                                    type="color"
                                    value={form.styleAttributes.baseColor ?? '#D6A6B1'}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            styleAttributes: { ...form.styleAttributes, baseColor: e.target.value },
                                        })
                                    }
                                    className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                                />
                            </label>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Live preview</span>
                            <div className="bg-cream rounded-lg p-4">
                                {(() => {
                                    const spec = categoryById(form.renderer)?.spec;
                                    return spec
                                        ? renderGarment(form.renderer, {
                                              style: form.styleAttributes,
                                              measurements: spec.typicalDefaults,
                                              className: 'max-w-[240px] mx-auto',
                                          })
                                        : null;
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.title ?? ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminPatternsPage;
