'use client';

import React, { useState } from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import {
    BlouseDesign,
    NECK_STYLES,
    BACK_STYLES,
    SLEEVE_STYLES,
    CLOSURES,
    EMBELLISHMENTS,
} from '@/types/blouseDesign';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminFormModal from '@/components/admin/AdminFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import SelectField from '@/components/ui/SelectField';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import BlousePreview from '@/components/customizer/BlousePreview';
import { Measurements } from '@/types/measurements';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// "three-quarter" -> "Three Quarter" for dropdown labels
function labelize(value: string): string {
    return value
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

type DesignForm = Omit<BlouseDesign, 'id' | 'createdAt' | 'updatedAt' | 'thumbnailUrl' | 'description'> & {
    description: string;
};

const defaultForm: DesignForm = {
    name: '',
    slug: '',
    description: '',
    neckStyle: 'round',
    backStyle: 'round',
    sleeveStyle: 'short',
    closure: 'hook',
    embellishment: 'plain',
    baseColor: '#D6A6B1',
    isActive: true,
    sortOrder: 0,
};

// Representative measurements for the in-form preview only.
const previewMeasurements: Measurements = {
    bust: 34,
    waist: 28,
    shoulderWidth: 14,
    blouseLength: 14,
    sleeveLength: 6,
    armhole: 15.5,
    frontNeckDepth: 6.5,
    backNeckDepth: 7,
};

const styleSelects = [
    { key: 'neckStyle', label: 'Neck Style', options: NECK_STYLES },
    { key: 'backStyle', label: 'Back Style', options: BACK_STYLES },
    { key: 'sleeveStyle', label: 'Sleeve Style', options: SLEEVE_STYLES },
    { key: 'closure', label: 'Closure', options: CLOSURES },
    { key: 'embellishment', label: 'Embellishment', options: EMBELLISHMENTS },
] as const;

const AdminBlouseDesignsPage = () => {
    const { items: designs, isLoading, error, create, update, remove } = useAdminCrud<BlouseDesign>('blouse-designs');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BlouseDesign | null>(null);
    const [deleteItem, setDeleteItem] = useState<BlouseDesign | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState<DesignForm>(defaultForm);
    const [previewView, setPreviewView] = useState<'front' | 'back'>('front');

    const openCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        setPreviewView('front');
        setIsFormOpen(true);
    };

    const openEdit = (design: BlouseDesign) => {
        setEditingItem(design);
        setForm({
            name: design.name,
            slug: design.slug,
            description: design.description ?? '',
            neckStyle: design.neckStyle,
            backStyle: design.backStyle,
            sleeveStyle: design.sleeveStyle,
            closure: design.closure,
            embellishment: design.embellishment,
            baseColor: design.baseColor,
            isActive: design.isActive,
            sortOrder: design.sortOrder,
        });
        setPreviewView('front');
        setIsFormOpen(true);
    };

    const handleNameChange = (value: string) => {
        const updated: Partial<DesignForm> = { name: value };
        if (!editingItem) {
            updated.slug = generateSlug(value);
        }
        setForm({ ...form, ...updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await update(editingItem.id, form);
                showToast('Design updated successfully');
            } else {
                await create(form);
                showToast('Design created successfully');
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
            showToast('Design deleted successfully');
            setDeleteItem(null);
        } catch {
            showToast('Failed to delete design', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        {
            key: 'neckStyle', label: 'Style', render: (_v: unknown, item: BlouseDesign) =>
                `${labelize(item.neckStyle)} neck, ${labelize(item.sleeveStyle)} sleeve`
        },
        { key: 'embellishment', label: 'Embellishment', render: (v: unknown) => labelize(String(v ?? '')) },
        {
            key: 'baseColor', label: 'Color', render: (v: unknown) => (
                <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: String(v ?? '#FFF') }} />
                    <span className="text-xs text-gray-500">{String(v ?? '')}</span>
                </span>
            )
        },
        {
            key: 'isActive', label: 'Active', render: (v: unknown) => (v ? 'Yes' : 'No')
        },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Blouse Designs"
                subtitle="Manage the designs customers can pick in the customizer"
                actionLabel="Add Design"
                onAction={openCreate}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm" role="alert">
                    Couldn&apos;t load designs: {error}. Check that Supabase credentials are configured and
                    migration <code>002_blouse_customizer.sql</code> has been applied.
                </div>
            )}

            <AdminTable
                columns={columns}
                data={designs}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                isLoading={isLoading}
            />

            <AdminFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? 'Edit Design' : 'Add Design'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={editingItem ? 'Save Changes' : 'Create'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div>
                        <Input
                            label="Name"
                            value={form.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            required
                        />
                        <Input
                            label="Slug"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            required
                        />
                        <TextArea
                            label="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                        {styleSelects.map(({ key, label, options }) => (
                            <SelectField
                                key={key}
                                label={label}
                                value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                options={options.map((opt) => ({ value: opt, label: labelize(opt) }))}
                            />
                        ))}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Base Color</label>
                            <input
                                type="color"
                                value={form.baseColor}
                                onChange={(e) => setForm({ ...form, baseColor: e.target.value })}
                                className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                            />
                        </div>
                        <Input
                            label="Sort Order"
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        />
                        <ToggleSwitch
                            label="Active (visible in the customizer)"
                            checked={form.isActive}
                            onChange={(checked) => setForm({ ...form, isActive: checked })}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="block text-sm font-medium text-gray-700">Preview</span>
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
                                        {labelize(v)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-cream rounded-lg p-4 sticky top-0">
                            <BlousePreview design={form} measurements={previewMeasurements} view={previewView} />
                        </div>
                    </div>
                </div>
            </AdminFormModal>

            <DeleteConfirmDialog
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.name || ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminBlouseDesignsPage;
