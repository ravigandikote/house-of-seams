'use client';

import React, { useMemo, useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { GarmentDesign } from '@/types/garmentDesign';
import { CustomizerCategory, garmentDesignCategories } from '@/types/customizerCategories';
import { renderGarment } from '@/components/customizer/rendererRegistry';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import SelectField from '@/components/ui/SelectField';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

// ONE Designs section for every garment_designs-backed category (blouse
// keeps its own section). Tabs come from the manifest; the edit modal's
// style selects and the live sketch preview are driven entirely by the
// selected category's styleEnums + renderer config — a new category
// appears here with zero changes to this file.

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

interface DesignForm {
    name: string;
    slug: string;
    description: string;
    styleAttributes: Record<string, string>;
    isSignature: boolean;
    designerNote: string;
    sortOrder: string;
    isActive: boolean;
}

function defaultForm(category: CustomizerCategory): DesignForm {
    const styleAttributes: Record<string, string> = { baseColor: '#D6A6B1' };
    for (const [key, allowed] of Object.entries(category.styleEnums ?? {})) {
        styleAttributes[key] = allowed[0];
    }
    return {
        name: '',
        slug: '',
        description: '',
        styleAttributes,
        isSignature: false,
        designerNote: '',
        sortOrder: '0',
        isActive: true,
    };
}

const AdminDesignsPage = () => {
    const categories = useMemo(() => garmentDesignCategories(), []);
    const { items: designs, isLoading, error, create, update, remove } =
        useAdminCrud<GarmentDesign>('garment-designs');
    const [tab, setTab] = useState(categories[0]?.id ?? 'lehenga');
    const [editItem, setEditItem] = useState<GarmentDesign | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<DesignForm | null>(null);
    const [deleteItem, setDeleteItem] = useState<GarmentDesign | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const activeCategory = categories.find((c) => c.id === tab) ?? categories[0];
    const tabDesigns = designs.filter((d) => d.category === tab);

    const openCreate = () => {
        if (!activeCategory) return;
        setEditItem(null);
        setForm(defaultForm(activeCategory));
        setIsCreating(true);
    };

    const openEdit = (design: GarmentDesign) => {
        const cat = categories.find((c) => c.id === design.category);
        if (!cat) return;
        setEditItem(design);
        setForm({
            ...defaultForm(cat),
            name: design.name,
            slug: design.slug,
            description: design.description ?? '',
            styleAttributes: { ...defaultForm(cat).styleAttributes, ...design.styleAttributes },
            isSignature: design.isSignature,
            designerNote: design.designerNote ?? '',
            sortOrder: String(design.sortOrder ?? 0),
            isActive: design.isActive,
        });
        setIsCreating(false);
    };

    const closeModal = () => {
        setForm(null);
        setEditItem(null);
        setIsCreating(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form || !activeCategory) return;
        setIsSubmitting(true);
        try {
            const payload: Partial<GarmentDesign> = {
                category: editItem?.category ?? activeCategory.id,
                name: form.name,
                slug: form.slug || undefined,
                description: form.description || null,
                styleAttributes: form.styleAttributes,
                isSignature: form.isSignature,
                designerNote: form.designerNote || null,
                sortOrder: Number(form.sortOrder) || 0,
                isActive: form.isActive,
            };
            if (editItem) {
                await update(editItem.id, payload);
                showToast('Design updated');
            } else {
                await create(payload);
                showToast('Design created');
            }
            closeModal();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to save the design', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        try {
            await remove(deleteItem.id);
            showToast('Design deleted');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete the design', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const modalCategory = editItem
        ? categories.find((c) => c.id === editItem.category) ?? activeCategory
        : activeCategory;
    const previewRendererId =
        modalCategory?.renderer?.kind === 'single' ? modalCategory.renderer.rendererId : null;

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        {
            key: 'styleAttributes', label: 'Styles', render: (v: unknown) => {
                const attrs = (v ?? {}) as Record<string, string>;
                return Object.entries(attrs)
                    .filter(([k]) => k !== 'baseColor')
                    .map(([, val]) => labelize(val))
                    .join(' · ') || '—';
            }
        },
        {
            key: 'isSignature', label: 'Signature', render: (v: unknown) => (v ? '★' : '—')
        },
        { key: 'sortOrder', label: 'Order' },
        {
            key: 'isActive', label: 'Active', render: (v: unknown) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {v ? 'Active' : 'Hidden'}
                </span>
            )
        },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Designs"
                subtitle="Pickable designs for every category beyond blouses (blouses keep their own section)"
                actionLabel={`Add ${activeCategory?.label ?? ''} Design`}
                onAction={openCreate}
            />

            <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setTab(c.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            tab === c.id
                                ? 'bg-dusty-rose border-dusty-rose text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-dusty-rose'
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">
                    Couldn&apos;t load designs: {error}. Check that migration{' '}
                    <code>009_garment_designs.sql</code> has been applied.
                </div>
            )}

            <AdminTable
                columns={columns}
                data={tabDesigns}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={!!form}
                onClose={closeModal}
                title={
                    editItem
                        ? `Edit ${modalCategory?.label} design`
                        : `New ${modalCategory?.label} design`
                }
                onSubmit={handleSave}
                isSubmitting={isSubmitting}
                submitLabel={isCreating ? 'Create' : 'Save'}
            >
                {form && modalCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div>
                            <Input
                                label="Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                            <Input
                                label="Slug (optional — generated from name)"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            />
                            <TextArea
                                label="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={2}
                            />
                            {Object.entries(modalCategory.styleEnums ?? {}).map(([key, allowed]) => (
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
                                Base Color
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
                            <TextArea
                                label="Designer's note (shown with the design)"
                                value={form.designerNote}
                                onChange={(e) => setForm({ ...form, designerNote: e.target.value })}
                                rows={2}
                            />
                            <div className="grid grid-cols-2 gap-x-4 items-end">
                                <Input
                                    label="Sort Order"
                                    type="number"
                                    value={form.sortOrder}
                                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                />
                                <div className="space-y-2 pb-4">
                                    <ToggleSwitch
                                        label="Signature piece"
                                        checked={form.isSignature}
                                        onChange={(checked) => setForm({ ...form, isSignature: checked })}
                                    />
                                    <ToggleSwitch
                                        label="Active"
                                        checked={form.isActive}
                                        onChange={(checked) => setForm({ ...form, isActive: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Live preview</span>
                            <div className="bg-cream rounded-lg p-4">
                                {previewRendererId && modalCategory.spec ? (
                                    renderGarment(previewRendererId, {
                                        style: form.styleAttributes,
                                        measurements: modalCategory.spec.typicalDefaults,
                                        className: 'max-w-[260px] mx-auto',
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        Preview unavailable for this category
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.name ?? ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminDesignsPage;
